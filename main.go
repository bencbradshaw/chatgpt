package main

import (
	"chatgpt/handlers"
	"net/http"
	"os"

	"github.com/bencbradshaw/framework"
	esbuild "github.com/evanw/esbuild/pkg/api"
)

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

func main() {
	if os.Getenv("BUILD") == "true" {
		buildParams := framework.InitParams{
			EsbuildOpts: esbuild.BuildOptions{
				EntryPoints:       []string{"./app/src/index.ts"},
				MinifyWhitespace:  true,
				MinifyIdentifiers: true,
				MinifySyntax:      true,
				Sourcemap:         esbuild.SourceMapNone,
			},
			AutoRegisterTemplateRoutes: true,
		}
		framework.Build(buildParams)
		print("Build complete\n")
		return
	}
	mux := framework.Run(framework.InitParams{
		IsDevMode: true,
		EsbuildOpts: esbuild.BuildOptions{
			EntryPoints: []string{"./app/src/index.ts"},
		},
		AutoRegisterTemplateRoutes: true,
	})
	mux.Handle("/api/chat", cors(handlers.HandleChatRequest))
	print("Server started at http://localhost:2025\n")
	http.ListenAndServe(":2025", mux)
}
