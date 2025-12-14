package handlers

import (
	"chatgpt/models"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func HandleChatRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling chat request")
	defer r.Body.Close()

	var chatPrompt models.ChatPrompt
	if err := json.NewDecoder(r.Body).Decode(&chatPrompt); err != nil {
		log.Println("Error decoding request body:", err)
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	for i := range chatPrompt.Messages {
		for _, file := range chatPrompt.Messages[i].Files {
			chatPrompt.Messages[i].Content += "\nFile: " + file.Name + "\n" + file.Content
		}
	}

	// Strip Files field before upstream send
	type CleanMessage struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	cleanMessages := make([]CleanMessage, len(chatPrompt.Messages))
	for i, msg := range chatPrompt.Messages {
		cleanMessages[i] = CleanMessage{
			Role:    msg.Role,
			Content: msg.Content,
		}
	}

	var authToken string
	var endpoint string
	useResponsesAPI := false
	switch chatPrompt.Engine {
	case "gpt-4o", "gpt-4o-mini", "o3-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-5.1", "gpt-5.2":
		authToken = os.Getenv(envOpenAiSk)
		if strings.HasPrefix(chatPrompt.Engine, "gpt-5") {
			useResponsesAPI = true
			endpoint = openAiResponsesEndpoint
		} else {
			endpoint = openAiChatEndpoint
		}
	default:
		authToken = os.Getenv(envVeniceAiSk)
		endpoint = veniceAiChatEndpoint
	}

	if authToken == "" {
		respondWithError(w, "API key not set. set at least 2 keys. export OPEN_AI_SK=THEKEY and export VENICE_AI_SK=THEKEY", http.StatusInternalServerError)
		return
	}

	log.Println("Got Model", chatPrompt.Engine)

	var resp *http.Response
	var err error
	if useResponsesAPI {
		responsesRequest := models.ResponsesRequest{
			Model:  chatPrompt.Engine,
			Stream: true,
			Input:  cleanMessages,
		}
		resp, err = doPostRequest(endpoint, responsesRequest, authToken)
	} else {
		chatRequest := models.ChatRequest{
			Model:    chatPrompt.Engine,
			Stream:   true,
			Messages: cleanMessages,
		}
		resp, err = doPostRequest(endpoint, chatRequest, authToken)
	}
	if err != nil {
		respondWithError(w, "Error making a request to OpenAI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		respondWithError(w, "Upstream API error: "+string(b), resp.StatusCode)
		return
	}

	if useResponsesAPI {
		processResponsesStream(resp.Body, w)
		return
	}
	processChatStream(resp.Body, w)
}
