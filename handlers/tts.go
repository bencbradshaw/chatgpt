package handlers

import (
	"chatgpt/models"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
)

func HandleTtsRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling TTS (Text-to-Speech) request")
	defer r.Body.Close()

	if r.Method != http.MethodPost {
		respondWithError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var ttsReq models.TtsRequest
	if err := json.NewDecoder(r.Body).Decode(&ttsReq); err != nil {
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Prepare the payload for OpenAI API
	ttsPayload := map[string]string{
		"model": ttsReq.Model,
		"input": ttsReq.Input,
		"voice": ttsReq.Voice,
	}

	// Get the OpenAI secret key from environment variable
	authToken := os.Getenv(envOpenAiSk)

	// Make the POST request to OpenAI's Text-to-Speech endpoint
	openAiTtsEndpoint := openAiBaseUrl + "/audio/speech"
	resp, err := doPostRequest(openAiTtsEndpoint, ttsPayload, authToken)
	if err != nil {
		respondWithError(w, "Error making request to OpenAI TTS API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Stream the resulting audio back to the client
	w.Header().Set(contentTypeHeader, "audio/mpeg")
	w.WriteHeader(resp.StatusCode)
	if _, err := io.Copy(w, resp.Body); err != nil {
		log.Println("Error streaming TTS audio response to client:", err)
	}
}
