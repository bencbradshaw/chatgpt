.PHONY: run
run:
	go run main.go --dev
build:
	cd frontend && npm run tsc && cd ..
	rm -rf static public
	export BUILD=true && go run main.go
	go build -o public/main main.go 
	cp -r static public/
	cp -r templates public/