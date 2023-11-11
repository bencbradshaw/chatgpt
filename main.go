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

func handleRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "text/event-stream")
	// Read the request body
	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer r.Body.Close()

	// Unmarshal the request body into a ChatPrompt struct
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
	// Create a ChatRequest
	fmt.Println("sending request with engine:", chatPrompt.Engine)
	chatRequest := ChatRequest{
		Model:    chatPrompt.Engine,
		Stream:   true,
		Messages: chatPrompt.Messages,
	}

	// Marshal the ChatRequest into JSON
	jsonData, err := json.Marshal(chatRequest)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Prepare the data for the POST request
	data := bytes.NewBuffer(jsonData)

	// Create a new request
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", data)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Set the headers
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", openAiSk))
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("status code", resp.StatusCode)
	fmt.Println("status code", resp.Body)

	defer resp.Body.Close()

	// Read the response body line by line (chunk by chunk)
	reader := bufio.NewReader(resp.Body)
	var jsonStr string
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			// handle error
			fmt.Println(err)
			break
		}

		// Accumulate the chunks
		jsonStr += strings.TrimPrefix(line, "data: ")

		// Try to unmarshal the accumulated chunks into a Chunk struct
		var chunk Chunk
		err = json.Unmarshal([]byte(jsonStr), &chunk)
		if err != nil {
			// If there's an error, continue to the next chunk
			continue
		}

		// Extract the content from the choices array
		for _, choice := range chunk.Choices {
			content := choice.Delta.Content

			// Process the content
			//fmt.Println(content)

			// Write the content to the response
			_, err = w.Write([]byte(content))
			if err != nil {
				// handle error
				fmt.Println(err)
				break
			}

			// Flush the response writer
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			} else {
				fmt.Println("Unable to convert http.ResponseWriter to http.Flusher")
				break
			}
		}

		// Reset the accumulated chunks
		jsonStr = ""
	}
}

func main() {
	http.HandleFunc("/", handleRequest)

	fmt.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println(err)
	}
}
