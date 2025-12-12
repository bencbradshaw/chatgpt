package handlers

import (
	"chatgpt/models"
	"encoding/json"
	"log"
	"net/http"
	"os"
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
	var authToken string
	var endpoint string
	switch chatPrompt.Engine {
	case "gpt-4o", "gpt-4o-mini", "o3-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano":
		authToken = os.Getenv(envOpenAiSk)
		endpoint = openAiChatEndpoint
	default:
		authToken = os.Getenv(envVeniceAiSk)
		endpoint = veniceAiChatEndpoint
	}

	if authToken == "" {
		respondWithError(w, "API key not set. set at least 2 keys. export OPEN_AI_SK=THEKEY and export VENICE_AI_SK=THEKEY", http.StatusInternalServerError)
		return
	}

	log.Println("Got Model", chatPrompt.Engine)

	chatRequest := models.ChatRequest{
		Model:    chatPrompt.Engine,
		Stream:   true,
		Messages: chatPrompt.Messages,
	}

	resp, err := doPostRequest(endpoint, chatRequest, authToken)
	if err != nil {
		respondWithError(w, "Error making a request to OpenAI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	processChatStream(resp.Body, w)
}
