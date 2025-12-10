SERVER_DIR := server

.PHONY: help install db-up migrate seed dev start setup generate

help:
	@echo "Available commands:"
	@echo "  make install  - Install backend dependencies"
	@echo "  make db-up    - Start PostgreSQL database via Docker"
	@echo "  make migrate  - Run Prisma migrations"
	@echo "  make generate - Generate Prisma client"
	@echo "  make seed     - Seed the database"
	@echo "  make dev      - Start the backend server in development mode"
	@echo "  make start    - Start the backend server in production mode (PM2)"
	@echo "  make setup    - Full setup: install, db-up, migrate, seed"

install:
	cd $(SERVER_DIR) && npm install

db-up:
	cd $(SERVER_DIR) && docker compose up -d

migrate:
	cd $(SERVER_DIR) && npx prisma migrate dev

generate:
	cd $(SERVER_DIR) && npx prisma generate

seed: generate
	cd $(SERVER_DIR) && node seed.js

dev:
	cd $(SERVER_DIR) && npx nodemon index.js

start:
	cd $(SERVER_DIR) && pm2 start ecosystem.config.js

setup: install db-up migrate seed
