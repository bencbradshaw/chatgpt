package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
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

func doPostRequest(url string, body interface{}, auth interface{}) (*http.Response, error) {
	jsonData, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	switch v := auth.(type) {
	case string:
		// If the auth is a string, use it directly as a bearer token.
		req.Header.Set("Authorization", fmt.Sprintf(authHeaderFmt, v))
	case oauth2.TokenSource:
		// If the auth is a TokenSource, get a token and apply it.
		token, err := v.Token()
		if err != nil {
			return nil, err
		}
		req.Header.Set("Authorization", fmt.Sprintf(authHeaderFmt, token.AccessToken))
	default:
		// If none of the types match, return an error.
		return nil, fmt.Errorf("unsupported authorization type %T", auth)
	}
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

// create another function to handle vision request
// it will accept a file, and encode it into base 64
// then it will post this body
//
//	payload = {
//	    "model": "gpt-4-vision-preview",
//	    "messages": [
//	      {
//	        "role": "user",
//	        "content": [
//	          {
//	            "type": "text",
//	            "text": "What’s in this image?"
//	          },
//	          {
//	            "type": "image_url",
//	            "image_url": {
//	              "url": f"data:image/jpeg;base64,{base64_image}"
//	            }
//	          }
//	        ]
//	      }
//	    ],
//	    "max_tokens": 300
//	}
//
// to the same endpoint as the chat request

func handleVisionRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling vision request")
	if r.Method != http.MethodPost {
		respondWithError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	contentType := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "multipart/form-data") {
		respondWithError(w, "Invalid Content-Type. Expected multipart/form-data", http.StatusBadRequest)
		return
	}

	if err := r.ParseMultipartForm(32 << 20); err != nil { // 32 MB is the max memory used to parse the form
		log.Println("Error parsing multipart form:", err)
		respondWithError(w, "Error parsing multipart form: "+err.Error(), http.StatusBadRequest)
		return
	}
	// Read the file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		log.Println("Error reading file from request:", err)
		respondWithError(w, "Invalid file in request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if header.Size == 0 {
		respondWithError(w, "Empty file provided", http.StatusBadRequest)
		return
	}

	// Encode the file into base64
	buf := new(bytes.Buffer)
	encoder := base64.NewEncoder(base64.StdEncoding, buf)
	_, err = io.Copy(encoder, file)
	if err != nil {
		respondWithError(w, "Error encoding file to base64", http.StatusInternalServerError)
		return
	}
	if err = encoder.Close(); err != nil {
		respondWithError(w, "Error closing encoder", http.StatusInternalServerError)
		return
	}
	base64Image := buf.String()

	// Create the payload
	visionPayload := map[string]interface{}{
		"model": "gpt-4-vision-preview",
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": []map[string]interface{}{
					{
						"type": "text",
						"text": "What is in this image?",
					},
					{
						"type": "image_url",
						"image_url": map[string]string{
							"url": fmt.Sprintf("data:image/jpeg;base64,%s", base64Image),
						},
					},
				},
			},
		},
		"max_tokens": 300,
	}

	authToken := os.Getenv(envOpenAiSk)
	resp, err := doPostRequest(openAiChatEndpoint, visionPayload, authToken)
	if err != nil {
		respondWithError(w, "Error making a request to OpenAI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Process the response
	if resp.StatusCode != http.StatusOK {
		var apiError map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&apiError); err == nil {
			respondWithJSON(w, apiError)
		} else {
			respondWithError(w, "Error with OpenAI API", http.StatusInternalServerError)
		}
		return
	}

	var apiResponse OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		respondWithError(w, "Error decoding OpenAI API response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, apiResponse)
}

func handleVertexRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling Google Vertex AI request")
	if r.Method != http.MethodPost {
		respondWithError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()

	vertexEndpoint := os.Getenv("VERTEX_ENDPOINT")
	key, err := os.ReadFile("gcp-vertex-sk.json")
	if err != nil {
		respondWithError(w, "Error reading service account key file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	creds, err := google.CredentialsFromJSON(context.Background(), key, "https://www.googleapis.com/auth/cloud-platform")
	if err != nil {
		respondWithError(w, "Error obtaining Google credentials from JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
	tokenSource := creds.TokenSource

	var requestBody map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := doPostRequest(vertexEndpoint, requestBody, tokenSource)
	if err != nil {
		respondWithError(w, "Error making a request to Google Vertex AI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the response from the Vertex AI API to the client
	w.Header().Set(contentTypeHeader, contentTypeJSON)
	w.WriteHeader(resp.StatusCode)
	if _, err := io.Copy(w, resp.Body); err != nil {
		log.Println("Error copying Vertex AI API response to client:", err)
	}
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set(accessControlAllow, "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set(accessControlHeaders, "Accept, Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		switch r.URL.Path {
		case "/":
			handleChatRequest(w, r)
		case "/image":
			handleImageRequest(w, r)
		case "/vision":
			handleVisionRequest(w, r)
		case "/vertex":
			handleVertexRequest(w, r)
		default:
			http.NotFound(w, r)
		}
	})

	log.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
