package handlers

import (
	"bytes"
	"chatgpt/models"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func HandleVisionRequest(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling vision request")
	w.Header().Set(contentTypeHeader, "application/json")
	r.ParseMultipartForm(100)
	for key, value := range r.Form {
		log.Println(key, value)
	}

	// Temporary: Read and log the raw request body
	_, err := io.ReadAll(r.Body)
	if err != nil {
		log.Println("Error reading request body:", err)
		respondWithError(w, "Could not read request body", http.StatusInternalServerError)
		return
	}
	if r.Method != http.MethodPost {
		respondWithError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Set the Content-Type header with the boundary parameter
	r.Header.Set("Content-Type", "multipart/form-data; boundary=boundary-string")

	contentType := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "multipart/form-data") {
		respondWithError(w, "Invalid Content-Type. Expected multipart/form-data", http.StatusBadRequest)
		return
	}

	// if err := r.ParseMultipartForm(32 << 20); err != nil { // 32 MB is the max memory used to parse the form
	// 	respondWithError(w, "Error parsing multipart form: "+err.Error(), http.StatusBadRequest)
	// 	return
	// }
	// Read the file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		log.Println("Error reading file from request:", err)
		respondWithError(w, "Invalid file in request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	log.Printf("Uploaded File: %+v\n", header.Filename)
	log.Printf("File Size: %+v\n", header.Size)
	log.Printf("MIME Header: %+v\n", header.Header)

	if header.Size == 0 {
		respondWithError(w, "Empty file provided", http.StatusBadRequest)
		return
	}

	// Encode the file into base64
	buf := new(bytes.Buffer)
	encoder := base64.NewEncoder(base64.StdEncoding, buf)
	_, err = io.Copy(encoder, file)
	if err != nil {
		respondWithError(w, "Error encoding file to base64", http.StatusInternalServerError)
		return
	}
	if err = encoder.Close(); err != nil {
		respondWithError(w, "Error closing encoder", http.StatusInternalServerError)
		return
	}
	base64Image := buf.String()

	// Create the payload
	visionPayload := map[string]interface{}{
		"model": "gpt-4-vision-preview",
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": []map[string]interface{}{
					{
						"type": "text",
						"text": "What is in this image?",
					},
					{
						"type": "image_url",
						"image_url": map[string]string{
							"url": fmt.Sprintf("data:image/jpeg;base64,%s", base64Image),
						},
					},
				},
			},
		},
		"max_tokens": 300,
	}

	authToken := os.Getenv(envOpenAiSk)
	resp, err := doPostRequest(openAiChatEndpoint, visionPayload, authToken)
	if err != nil {
		respondWithError(w, "Error making a request to OpenAI API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Process the response
	if resp.StatusCode != http.StatusOK {
		var apiError map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&apiError); err == nil {
			respondWithJSON(w, apiError)
		} else {
			respondWithError(w, "Error with OpenAI API", http.StatusInternalServerError)
		}
		return
	}

	var apiResponse models.OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		respondWithError(w, "Error decoding OpenAI API response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, map[string]interface{}{"content": apiResponse.Choices[0].Message.Content})
}
