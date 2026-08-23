.PHONY: dev dev-web dev-backend build build-web sync-web build-backend lint clean

dev-web:
	cd web && pnpm dev

dev-backend:
	cd backend && go run ./cmd/lib-managerr

build-web:
	cd web && pnpm build

sync-web: build-web
	rm -rf backend/internal/webui/dist
	mkdir -p backend/internal/webui/dist
	cp -R web/dist/. backend/internal/webui/dist/
	touch backend/internal/webui/dist/.gitkeep

build-backend: sync-web
	cd backend && go build -o ../bin/lib-managerr ./cmd/lib-managerr

build: build-backend

lint:
	cd web && pnpm lint
	cd backend && gofmt -l . && go vet ./...

clean:
	rm -rf web/dist backend/internal/webui/dist bin
	mkdir -p backend/internal/webui/dist
	touch backend/internal/webui/dist/.gitkeep
