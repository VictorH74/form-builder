reset_all:
	docker compose down --volumes --remove-orphans
	sudo rm -rf data
	make build

make start:
	make build
	make migrations 
run: 
	docker compose up -d

down:
	docker compose down

build:
	make remove_migration_files
	docker compose build --no-cache
	make run

rebuild_web:
	docker compose up -d --no-deps --build web

rebuild_backend:
	docker compose up -d --no-deps --build api

migrations:
	docker exec -it formbuilder_api bash -c "python manage.py makemigrations"
	docker exec -it formbuilder_api bash -c "python manage.py migrate"

remove_migration_files:
	sudo find . -path "./backend/*/migrations/*.py" -not -name "__init__.py" -delete

superuser:
	docker exec -it formbuilder_api bash -c "python manage.py createsuperuser"

logs:
	docker compose logs -f

db_bash:
	docker exec -it formbuilder_db bash

backend_bash:
	docker exec -it formbuilder_api bash

envs:
	cp .env.example .env

backend_ip_address:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' formbuilder_api