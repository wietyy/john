setup:
    #!/usr/bin/env bash
    set -e
    if [ -f backend/.env ]; then
        echo ".env already exists, skipping"
    else
        printf 'PORT=3000\nDATABASE=main.db\n' > backend/.env
        echo "created backend/.env"
    fi

build: setup
    cd backend && npm run build
    cd frontend && npm run build
    cp -r backend prod
    cp -r frontend/dist prod/frontend

start:
    cd prod && npm run start

dev: setup
    #!/usr/bin/env bash
    set -e
    cd backend && npx tsc && node dist/index.js &
    cd frontend && npm run dev &
    wait