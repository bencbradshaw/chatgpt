package handlers

import (
	"chatgpt/models"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
)

func ClassifyRequest(fullStringify string) string {

	defaultSysMessage := models.Message{
		Role:    "system",
		Content: "You are a classifier machine. Based on the text you receive, which is an http request headers and body, you will classify the request as one of the following: chat, image, vision, tts, or other.",
	}

	chatReq := models.ChatRequest{
		Model: "gpt-4-1106-preview",
		Messages: append([]models.Message{defaultSysMessage}, models.Message{
			Role:    "user",
			Content: fullStringify,
		}),
		Stream: false,
	}
	authToken := os.Getenv(envOpenAiSk)
	resp, err := doPostRequest("https://api.openai.com/v1/chat/completions", chatReq, authToken)
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return ""
	}
	var classificationResp models.OpenAIResponse
	err = json.Unmarshal(bodyBytes, &classificationResp)
	if err != nil {
		return ""
	}
	log.Println("classified as:", classificationResp.Choices[0].Message.Content)
	return classificationResp.Choices[0].Message.Content
}

func HandleAuto(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	if r.Method != http.MethodPost {
		respondWithError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	fullStringify, err := stringifyRequest(r)
	if err != nil {
		respondWithError(w, "Bad request", http.StatusBadRequest)
		return
	}

	if err != nil {
		respondWithError(w, "Bad request", http.StatusBadRequest)
		return
	}

	classification := ClassifyRequest(fullStringify)
	switch classification {
	case "chat":
		HandleChatRequest(w, r)
	case "image":
		HandleImageRequest(w, r)
	// ... handle other cases similarly
	default:
		respondWithError(w, "unsupported", http.StatusBadRequest)
	}

}
