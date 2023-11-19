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
	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		log.Println("Handling request:", req.URL.Path)
		log.Println("Request method:", req.Method)
		log.Println("Request Content-Type:", req.Header.Get("Content-Type"))
		res.Header().Set(accessControlAllow, "*")
		res.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		res.Header().Set(accessControlHeaders, "Accept, Content-Type")
		if req.Method == http.MethodOptions {
			res.WriteHeader(http.StatusOK)
			return
		}
		switch req.URL.Path {
		case "/":
			handlers.HandleChatRequest(res, req)
		case "/image":
			handlers.HandleImageRequest(res, req)
		case "/vision":
			handlers.HandleVisionRequest(res, req)
		case "/vertex":
			handlers.HandleVertexRequest(res, req)
		case "/tts":
			handlers.HandleTtsRequest(res, req)
		case "/auto":
			handlers.HandleAuto(res, req)
		default:
			http.NotFound(res, req)
		}
		log.Println("Response end")
	})

	log.Println("Starting server on port 8081")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
