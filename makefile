.PHONY: run
run:
	rm -rf static
	go run main.go --dev
build:
	cd app && npm run tsc && cd ..
	rm -rf static public
	export BUILD=true && go run main.go
	go build -o public/main main.go 
	GOARCH=amd64 GOOS=linux go build -o linux/main main.go
	cp -r static public/
	cp -r templates public/
	cp -r static linux/
	cp -r templates linux/