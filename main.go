package main

import (
	"chatgpt/handlers"
	"framework"
	"log"
	"net/http"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}

func main() {
	mux := framework.Init(framework.InitParams{
		EsbuildOpts: api.BuildOptions{
			EntryPoints: []string{"./frontend/src/index.ts"},
		},
		AutoRegisterTemplateRoutes: true,
	})
	mux.Handle("/image", cors(handlers.HandleImageRequest))
	mux.Handle("/vision", cors(handlers.HandleVisionRequest))
	mux.Handle("/tts", cors(handlers.HandleTtsRequest))
	mux.Handle("/chat", cors(handlers.HandleChatRequest))
	http.ListenAndServe(":2025", mux)
}

func cors(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		res.Header().Set("Access-Control-Allow-Origin", "*")
		res.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		res.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type")
		if req.Method == http.MethodOptions {
			res.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(res, req)
	})
}
