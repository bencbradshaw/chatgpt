package models

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
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

type OpenAIImageRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	N      int    `json:"n"`
	Size   string `json:"size"`
}

type OpenAIImageResponse struct {
	Created int `json:"created"`
	Data    []struct {
		URL string `json:"url"`
	} `json:"data"`
}

type OpenAITtsRequest struct {
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

type Engine string

const (
	GPT4Preview       Engine = "gpt-4-1106-preview"
	GPT4              Engine = "gpt-4"
	GPT4VisionPreview Engine = "gpt-4-vision-preview"
	GPT3_5Turbo       Engine = "gpt-3.5-turbo"
	DallE3            Engine = "dall-e-3"
	DallE2            Engine = "dall-e-2"
	TTS1              Engine = "tts-1"
	Vertex            Engine = "vertex"
	Auto              Engine = "auto"
)

type Thread struct {
	ID             int       `json:"id"`
	Headline       string    `json:"headline"`
	SystemMessage  string    `json:"system_message"`
	SelectedEngine Engine    `json:"selected_engine"`
	IncludeContext bool      `json:"include_context"`
	History        []Message `json:"history"`
}
