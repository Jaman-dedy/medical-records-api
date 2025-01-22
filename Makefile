DOCKER_COMPOSE = docker-compose

# Colors for terminal output
GREEN = \033[0;32m
NC = \033[0m # No Color
YELLOW = \033[0;33m

# Help command
.PHONY: help
help:
	@echo "$(GREEN)Available commands:$(NC)"
	@echo "$(YELLOW)make up$(NC)        - Start all containers in detached mode"
	@echo "$(YELLOW)make down$(NC)      - Stop all containers"
	@echo "$(YELLOW)make build$(NC)     - Build all containers"
	@echo "$(YELLOW)make rebuild$(NC)   - Rebuild all containers"
	@echo "$(YELLOW)make logs$(NC)      - View logs of all containers"
	@echo "$(YELLOW)make logs-api$(NC)  - View logs of API container"
	@echo "$(YELLOW)make ps$(NC)        - List all running containers"
	@echo "$(YELLOW)make clean$(NC)     - Remove all containers and volumes"
	@echo "$(YELLOW)make shell$(NC)     - Access the API container shell"
	@echo "$(YELLOW)make db-shell$(NC)  - Access the PostgreSQL shell"

# Docker commands
.PHONY: up
up:
	$(DOCKER_COMPOSE) up -d

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONY: build
build:
	$(DOCKER_COMPOSE) build

.PHONY: rebuild
rebuild:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

.PHONY: logs-api
logs-api:
	$(DOCKER_COMPOSE) logs -f api

.PHONY: ps
ps:
	$(DOCKER_COMPOSE) ps

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans

.PHONY: shell
shell:
	$(DOCKER_COMPOSE) exec api sh

.PHONY: db-shell
db-shell:
	$(DOCKER_COMPOSE) exec postgres psql -U postgres -d medical_records

# Development shortcuts
.PHONY: dev
dev: up logs-api

.PHONY: restart
restart:
	$(DOCKER_COMPOSE) restart

# Database shortcuts
.PHONY: migrate
migrate:
	$(DOCKER_COMPOSE) exec api npm run migration:run

.PHONY: migration-generate
migration-generate:
	$(DOCKER_COMPOSE) exec api npm run migration:generate