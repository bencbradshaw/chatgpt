.PHONY: run
run:
	rm -rf static
	go run main.go --dev
build:
	cd app && npm run tsc && cd ..
	rm -rf static mac linux
	export BUILD=true && go run main.go
	GOARCH=amd64 GOOS=linux go build -o linux/main main.go
	GOARCH=arm64 GOOS=darwin go build -o mac/main main.go
	cp -r static linux/
	cp -r templates linux/
	cp -r static mac/
	cp -r templates mac/
clean:
	rm -rf static mac linux