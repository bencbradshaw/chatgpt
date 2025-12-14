package models

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
	Files   []struct {
		Name      string `json:"name"`
		Extension string `json:"extension"`
		Content   string `json:"content"`
	} `json:"files"`
}

type ChatRequest struct {
	Model    string      `json:"model"`
	Messages interface{} `json:"messages"`
	Stream   bool        `json:"stream"`
}

type ResponsesRequest struct {
	Model  string      `json:"model"`
	Input  interface{} `json:"input"`
	Stream bool        `json:"stream"`
}

type ChatPrompt struct {
	Engine   string    `json:"engine"`
	Messages []Message `json:"messages"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type Chunk struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int    `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason interface{} `json:"finish_reason"`
	} `json:"choices"`
}

type ImageRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	N      int    `json:"n"`
	Size   string `json:"size"`
}

type ImageResponse struct {
	Created int `json:"created"`
	Data    []struct {
		URL string `json:"url"`
	} `json:"data"`
}

type TtsRequest struct {
	Model string `json:"model"`
	Input string `json:"input"`
	Voice string `json:"voice"`
}

type VertexMessage struct {
	Author  string `json:"author"`
	Content string `json:"content"`
}

type ChatRequestML struct {
	Instances []struct {
		Messages []Message `json:"messages"`
	} `json:"instances"`
	Parameters struct {
		CandidateCount  int     `json:"candidateCount"`
		MaxOutputTokens int     `json:"maxOutputTokens"`
		Temperature     float64 `json:"temperature"`
	} `json:"parameters"`
}
