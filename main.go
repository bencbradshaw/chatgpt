package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

const (
	openAiBaseUrl        = "https://api.openai.com/v1"
	openAiChatEndpoint   = openAiBaseUrl + "/chat/completions"
	openAiImageEndpoint  = openAiBaseUrl + "/images/generations"
	contentTypeHeader    = "Content-Type"
	contentTypeJSON      = "application/json"
	authHeaderFmt        = "Bearer %s"
	envOpenAiSk          = "OPEN_AI_SK"
	accessControlAllow   = "Access-Control-Allow-Origin"
	accessControlHeaders = "Access-Control-Allow-Headers"
)

var httpClient = &http.Client{}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
}

type ChatPrompt struct {
	Engine   string    `json:"engine"`
	Messages []Message `json:"messages"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type Chunk struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int    `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason interface{} `json:"finish_reason"`
	} `json:"choices"`
}

type ImageRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	N      int    `json:"n"`
	Size   string `json:"size"`
}

type ImageResponse struct {
	Created int `json:"created"`
	Data    []struct {
		URL string `json:"url"`
	} `json:"data"`
}

func init() {
	// Load environment variables at the start of the application.
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}

func respondWithError(w http.ResponseWriter, errMsg string, statusCode int) {
	http.Error(w, errMsg, statusCode)
	log.Println(errMsg)
}

func doPostRequest(url string, body interface{}, authToken string) (*http.Response, error) {
	jsonData, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", fmt.Sprintf(authHeaderFmt, authToken))
	req.Header.Set(contentTypeHeader, contentTypeJSON)

	return httpClient.Do(req)
}

func handleChatRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling chat request")
	defer r.Body.Close()

	var chatPrompt ChatPrompt
	if err := json.NewDecoder(r.Body).Decode(&chatPrompt); err != nil {
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	authToken := os.Getenv(envOpenAiSk)

	chatRequest := ChatRequest{
		Model:    chatPrompt.Engine,
		Stream:   true,
		Messages: chatPrompt.Messages,
	}

	resp, err := doPostRequest(openAiChatEndpoint, chatRequest, authToken)
	if err != nil {
		respondWithError(w, "Error making a request to OpenAI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	processChatStream(resp.Body, w)
}

func processChatStream(openAIStream io.Reader, w http.ResponseWriter) {
	w.Header().Set(contentTypeHeader, "text/event-stream")
	w.Header().Set(accessControlAllow, "*")

	reader := bufio.NewReader(openAIStream)
	var jsonStr string
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				// If EOF is encountered, it may just be the end of the stream.
				// Check if you should be reconnecting or ending gracefully here.
				log.Println("Stream ended normally with EOF")
				break
			}
			log.Println("Error reading streaming response:", err)
			break
		}
		jsonStr += strings.TrimPrefix(line, "data: ")
		var chunk Chunk
		if err := json.Unmarshal([]byte(jsonStr), &chunk); err != nil {
			continue
		}
		// EOF might occur naturally here if there are no more choices - this is a normal termination.
		if len(chunk.Choices) == 0 {
			log.Println("No more choices, stream ended normally")
			break
		}
		for _, choice := range chunk.Choices {
			content := choice.Delta.Content
			if _, err := w.Write([]byte(content)); err != nil {
				log.Println("Error writing to response writer:", err)
				break
			}
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			} else {
				log.Println("Unable to convert http.ResponseWriter to http.Flusher")
				break
			}
		}
		jsonStr = ""
	}
}

func handleImageRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling image request")
	defer r.Body.Close()
	var imgReq ImageRequest
	if err := json.NewDecoder(r.Body).Decode(&imgReq); err != nil {
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	authToken := os.Getenv(envOpenAiSk)

	resp, err := doPostRequest(openAiImageEndpoint, imgReq, authToken)
	if err != nil {
		respondWithError(w, "Error making request to OpenAI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var res ImageResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		respondWithError(w, "Error decoding OpenAI response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(res.Data) == 0 { // Check to ensure we have at least one image in the response
		respondWithError(w, "No images returned by OpenAI", http.StatusInternalServerError)
		return
	}

	imageUrl := res.Data[0].URL
	downloadAndSaveImage(imageUrl, w)
}

func downloadAndSaveImage(imageUrl string, w http.ResponseWriter) {
	w.Header().Set(contentTypeHeader, contentTypeJSON)
	w.Header().Set(accessControlAllow, "*")

	resp, err := http.Get(imageUrl)
	if err != nil {
		respondWithError(w, "Error downloading image from URL: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	t := time.Now()
	filename := fmt.Sprintf("./frontend/src/assets/dall-e/dall-e_%s.png", t.Format("20060102_150405"))
	out, err := os.Create(filename)
	if err != nil {
		respondWithError(w, "Error creating image file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer out.Close()

	if _, err = io.Copy(out, resp.Body); err != nil {
		respondWithError(w, "Error saving image: "+err.Error(), http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, map[string]string{"url": strings.Replace(filename, "./frontend", "", 1)})
}

func respondWithJSON(w http.ResponseWriter, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		respondWithError(w, "Error encoding JSON response: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(response)
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Handle preflight (CORS) request
		if r.Method == http.MethodOptions {
			w.Header().Set(accessControlAllow, "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set(accessControlHeaders, "Accept, Content-Type")
			w.WriteHeader(http.StatusOK)
			return
		}
		switch r.URL.Path {
		case "/":
			handleChatRequest(w, r)
		case "/image":
			handleImageRequest(w, r)
		default:
			http.NotFound(w, r)
		}
	})

	log.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
