package handlers

import (
	"chatgpt/models"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2/google"
)

func HandleVertexRequest(w http.ResponseWriter, r *http.Request) {
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

	var requestBody struct {
		Messages []models.VertexMessage `json:"messages"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	messages := make([]models.Message, len(requestBody.Messages))
	for i, vMsg := range requestBody.Messages {
		messages[i] = models.Message{Role: vMsg.Author, Content: vMsg.Content} // Make sure Role matches the expected value for Vertex AI
	}

	chatReqBody := models.ChatRequestML{
		Instances: []struct {
			Messages []models.Message `json:"messages"`
		}{
			{
				Messages: messages, // Use the converted messages here
			},
		},
		Parameters: struct {
			CandidateCount  int     `json:"candidateCount"`
			MaxOutputTokens int     `json:"maxOutputTokens"`
			Temperature     float64 `json:"temperature"`
		}{
			CandidateCount:  1,
			MaxOutputTokens: 128, // Adjust as necessary
			Temperature:     0.5, // Adjust as necessary
		},
	}

	resp, err := doPostRequest(vertexEndpoint, chatReqBody, tokenSource)
	if err != nil {
		respondWithError(w, "Error making a request to Google Vertex AI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var apiError map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&apiError); err == nil {
			respondWithJSON(w, apiError)
		} else {
			respondWithError(w, "Error with OpenAI API", http.StatusInternalServerError)
		}
		return
	}

	var apiResponse struct {
		Predictions []struct {
			Candidates []struct {
				Content string `json:"content"`
			} `json:"candidates"`
		} `json:"predictions"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		respondWithError(w, "Error decoding Vertex AI response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(apiResponse.Predictions) == 0 || len(apiResponse.Predictions[0].Candidates) == 0 {
		respondWithError(w, "No predictions found in Vertex AI response", http.StatusInternalServerError)
		return
	}

	content := apiResponse.Predictions[0].Candidates[0].Content

	respondWithJSON(w, map[string]interface{}{
		"content": content,
	})
}
