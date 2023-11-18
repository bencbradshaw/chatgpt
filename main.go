package main

import (
	"chatgpt/handlers"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

const (
	accessControlAllow   = "Access-Control-Allow-Origin"
	accessControlHeaders = "Access-Control-Allow-Headers"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Handling request:", r.URL.Path)
		log.Println("Request method:", r.Method)
		log.Println("Request Content-Type:", r.Header.Get("Content-Type"))
		w.Header().Set(accessControlAllow, "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set(accessControlHeaders, "Accept, Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		switch r.URL.Path {
		case "/":
			handlers.HandleChatRequest(w, r)
		case "/image":
			handlers.HandleImageRequest(w, r)
		case "/vision":
			handlers.HandleVisionRequest(w, r)
		case "/vertex":
			handlers.HandleVertexRequest(w, r)
		case "/tts":
			handlers.HandleTtsRequest(w, r)
		case "/auto":
			handlers.HandleAuto(w, r)
		default:
			http.NotFound(w, r)
		}
		log.Println("Response end")
	})

	log.Println("Starting server on port 8081")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
