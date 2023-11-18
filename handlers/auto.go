package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

func HandleAuto(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	if r.Method != http.MethodPost {
		respondWithError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read the request body for inspection.
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		respondWithError(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	// Restore the body for subsequent reads from other handlers.
	r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// Attempt to determine the type of request.
	var data map[string]interface{}
	err = json.Unmarshal(bodyBytes, &data)
	if err != nil {
		respondWithError(w, "Error unmarshalling JSON body", http.StatusBadRequest)
		return
	}

}
