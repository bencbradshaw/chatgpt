package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

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

func handleChatRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("handling chat request")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "text/event-stream")
	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer r.Body.Close()
	var chatPrompt ChatPrompt
	err = json.Unmarshal(reqBody, &chatPrompt)
	if err != nil {
		fmt.Println(err)
		return
	}
	err = godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
		return
	}
	openAiSk := os.Getenv("OPEN_AI_SK")
	fmt.Println("sending request with engine:", chatPrompt.Engine)
	chatRequest := ChatRequest{
		Model:    chatPrompt.Engine,
		Stream:   true,
		Messages: chatPrompt.Messages,
	}
	jsonData, err := json.Marshal(chatRequest)
	if err != nil {
		fmt.Println(err)
		return
	}
	data := bytes.NewBuffer(jsonData)
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", data)
	if err != nil {
		fmt.Println(err)
		return
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", openAiSk))
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("status code", resp.StatusCode)
	fmt.Println("status code", resp.Body)

	defer resp.Body.Close()

	reader := bufio.NewReader(resp.Body)
	var jsonStr string
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println(err)
			break
		}

		jsonStr += strings.TrimPrefix(line, "data: ")

		var chunk Chunk
		err = json.Unmarshal([]byte(jsonStr), &chunk)
		if err != nil {
			continue
		}

		for _, choice := range chunk.Choices {
			content := choice.Delta.Content

			_, err = w.Write([]byte(content))
			if err != nil {
				fmt.Println(err)
				break
			}

			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			} else {
				fmt.Println("Unable to convert http.ResponseWriter to http.Flusher")
				break
			}
		}
		jsonStr = ""
	}
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

func handleImageRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("handling image request")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	var imgReq ImageRequest
	if err := json.NewDecoder(r.Body).Decode(&imgReq); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	client := &http.Client{}
	reqBody, _ := json.Marshal(imgReq)
	fmt.Println("sending request with body:", string(reqBody))
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/images/generations", bytes.NewBuffer(reqBody))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	err = godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
		return
	}
	openAiSk := os.Getenv("OPEN_AI_SK")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", openAiSk))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	var res ImageResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("dalle req status code: ", resp.StatusCode)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	imageUrl := res.Data[0].URL
	resp2, err := http.Get(imageUrl)
	if err != nil {
		fmt.Println(err)
	}
	defer resp2.Body.Close()
	t := time.Now()
	filename := fmt.Sprintf("./frontend/src/assets/dall-e/dall-e_%s.png", t.Format("20060102_150405")) // Create a new file
	out, err := os.Create(filename)
	if err != nil {
		fmt.Println(err)
	}
	defer out.Close()
	_, err = io.Copy(out, resp2.Body)
	if err != nil {
		fmt.Println(err)
	}
	filename = strings.Replace(filename, "./frontend", "", 1)
	fileData := map[string]string{
		"url": filename,
	}
	jsonData, err := json.Marshal(fileData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(jsonData)
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
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
	fmt.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println(err)
	}
}
