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

	var thread models.Thread
	if err := json.NewDecoder(r.Body).Decode(&thread); err != nil {
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	authToken := os.Getenv(envOpenAiSk)
	selectedEngine := models.Engine(thread.SelectedEngine)
	if selectedEngine == models.Engine("auto") {
		selectedEngine = models.Engine("gpt-4-1106-preview")
	}
	chatRequest := models.OpenAIChatRequest{
		Model:    string(selectedEngine),
		Stream:   true,
		Messages: thread.History,
	}

	resp, err := doPostRequest(openAiChatEndpoint, chatRequest, authToken)
	if err != nil {
		respondWithError(w, "Error making a request to OpenAI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	processChatStream(resp.Body, w)
}
