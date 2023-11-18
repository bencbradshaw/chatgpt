package handlers

import (
	"chatgpt/models"
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func HandleImageRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling image request")
	defer r.Body.Close()
	var imgReq models.ImageRequest
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

	var res models.ImageResponse
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
