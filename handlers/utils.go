package handlers

import (
	"bufio"
	"bytes"
	"chatgpt/models"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

const (
	openAiBaseUrl        = "https://api.openai.com/v1"
	veniceAiBaseUrl      = "https://api.venice.ai/api/v1"
	openAiChatEndpoint   = openAiBaseUrl + "/chat/completions"
	veniceAiChatEndpoint = veniceAiBaseUrl + "/chat/completions"
	contentTypeHeader    = "Content-Type"
	contentTypeJSON      = "application/json"
	authHeaderFmt        = "Bearer %s"
	envOpenAiSk          = "OPEN_AI_SK"
	envVeniceAiSk        = "VENICE_AI_SK"
	accessControlAllow   = "Access-Control-Allow-Origin"
	accessControlHeaders = "Access-Control-Allow-Headers"
)

var httpClient = &http.Client{}

func respondWithError(w http.ResponseWriter, errMsg string, statusCode int) {
	http.Error(w, errMsg, statusCode)
	log.Println(errMsg)
}

func doPostRequest(url string, body interface{}, auth interface{}) (*http.Response, error) {
	jsonData, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	switch v := auth.(type) {
	case string:
		// If the auth is a string, use it directly as a bearer token.
		req.Header.Set("Authorization", fmt.Sprintf(authHeaderFmt, v))
	default:
		// If none of the types match, return an error.
		return nil, fmt.Errorf("unsupported authorization type %T", auth)
	}
	req.Header.Set(contentTypeHeader, contentTypeJSON)

	return httpClient.Do(req)
}
func processChatStream(openAIStream io.Reader, w http.ResponseWriter) {
	w.Header().Set(contentTypeHeader, "text/event-stream")
	w.Header().Set(accessControlAllow, "*")

	reader := bufio.NewReader(openAIStream)
	var jsonStr string
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				// If EOF is encountered, it may just be the end of the stream.
				// Check if you should be reconnecting or ending gracefully here.
				log.Println("Stream ended normally with EOF")
				break
			}
			log.Println("Error reading streaming response:", err)
			break
		}
		jsonStr += strings.TrimPrefix(line, "data: ")
		var chunk models.Chunk
		if err := json.Unmarshal([]byte(jsonStr), &chunk); err != nil {
			continue
		}
		// EOF might occur naturally here if there are no more choices - this is a normal termination.
		if len(chunk.Choices) == 0 {
			log.Println("No more choices, stream ended normally")
			break
		}
		for _, choice := range chunk.Choices {
			content := choice.Delta.Content
			if _, err := w.Write([]byte(content)); err != nil {
				log.Println("Error writing to response writer:", err)
				break
			}
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
				log.Printf("Wrote chunk of %d bytes", len(content))
			} else {
				log.Println("Unable to convert http.ResponseWriter to http.Flusher")
				break
			}
		}
		jsonStr = ""
	}
}
func respondWithJSON(w http.ResponseWriter, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		respondWithError(w, "Error encoding JSON response: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(response)
}

func stringifyRequest(r *http.Request) (string, error) {
	var sb strings.Builder

	// Start with the request line
	sb.WriteString(fmt.Sprintf("%s %s %s\n", r.Method, r.URL.Path, r.Proto))

	// Add request headers
	for name, values := range r.Header {
		for _, value := range values {
			sb.WriteString(fmt.Sprintf("%s: %s\n", name, value))
		}
	}

	// Read the body without affecting the original reader (it cannot be re-read).
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		return "", err
	}

	// Write the body string to the string builder.
	sb.WriteString("\n")
	sb.WriteString(string(bodyBytes))

	// Since we read the body, replace the body with a new reader so it can be read again later.
	r.Body = io.NopCloser(strings.NewReader(string(bodyBytes)))

	return sb.String(), nil
}
