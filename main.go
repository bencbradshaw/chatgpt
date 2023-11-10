package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}
type ChatPrompt struct {
	Prompt string `json:"prompt"`
}
type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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
	chatRequest := ChatRequest{
		Model: "gpt-4",
		Messages: []Message{
			{
				Role:    "system",
				Content: "You are a helpful assistant.",
			},
			{
				Role:    "user",
				Content: chatPrompt.Prompt, // Replace the user content with the prompt
			},
		},
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
	defer resp.Body.Close()

	// Read the response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	// Unmarshal the response body into the struct
	var openAIResponse OpenAIResponse
	err = json.Unmarshal(respBody, &openAIResponse)
	if err != nil {
		// handle error
	}
	// Extract the choices[0].message.content value
	messageContent := openAIResponse.Choices[0].Message.Content
	// Define a struct or a map to marshal the extracted value into a JSON response
	response := map[string]string{
		"message": messageContent,
	}
	// Marshal the struct or map into a JSON response
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		// handle error
	}
	_, err = w.Write(jsonResponse)
	if err != nil {
		// handle error
	}

	if err != nil {
		fmt.Println(err)
		return
	}
}

func main() {
	http.HandleFunc("/", handleRequest)

	fmt.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println(err)
	}
}
