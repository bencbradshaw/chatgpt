package main

import (
	"chatgpt/handlers"
	"framework"
	"net/http"
	"os"

	"github.com/evanw/esbuild/pkg/api"
)

var params = framework.InitParams{
	EsbuildOpts: api.BuildOptions{
		EntryPoints: []string{"./app/src/index.ts"},
	},
	AutoRegisterTemplateRoutes: true,
}

func main() {
	if os.Getenv("BUILD") == "true" {
		framework.Build(params)
		print("Build complete \n")
		return
	}
	mux := framework.Run(params)
	mux.Handle("/api/chat", cors(handlers.HandleChatRequest))
	print("Server started at http://localhost:2025 \n")
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
