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
	authToken := os.Getenv(envOpenAiSk)

	chatRequest := models.ChatRequest{
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
