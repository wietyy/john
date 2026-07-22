build:
    cd backend && npm run build
    cd frontend && npm run build
    cp -r backend prod
    cp -r frontend/dist prod/frontend

start:
    cd prod && npm run start

dev:
    #!/usr/bin/env bash
    set -e
    cd backend && just run &
    cd frontend && npm run dev &
    wait