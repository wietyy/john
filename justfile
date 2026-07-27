check:
    #!/usr/bin/env bash
    set -euo pipefail
    command -v node >/dev/null 2>&1 || { echo "node not found — you need Node.js my dude"; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo "npm not found — you need npm my dude"; exit 1; }
    echo "prerequisites: ✅"

setup: check
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -f backend/.env ]; then
        echo ".env already exists, skipping"
    else
        printf 'PORT=3000\nDATABASE=main.db\n' > backend/.env
        echo "created backend/.env"
    fi
    if [ ! -d backend/node_modules ]; then
        echo "installing backend deps..."
        cd backend && npm install
    fi
    if [ ! -d frontend/node_modules ]; then
        echo "installing frontend deps..."
        cd frontend && npm install
    fi

build: setup
    #!/usr/bin/env bash
    set -euo pipefail
    echo "building backend..."
    (cd backend && npm run build) || { echo "backend build failed"; exit 1; }
    echo "building frontend..."
    (cd frontend && npm run build) || { echo "frontend build failed"; exit 1; }
    rm -rf prod
    cp -r backend prod
    cp -r frontend/dist prod/frontend
    echo "build complete — it's beautiful"

start:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -d prod ]; then
        echo "prod/ doesn't exist — run 'just build' first ya goof"
        exit 1
    fi
    if [ ! -f prod/package.json ]; then
        echo "prod/ is busted — run 'just build' again"
        exit 1
    fi
    if [ ! -d prod/node_modules ]; then
        echo "installing prod deps..."
        cd prod && npm install --production
    fi
    cd prod && npm run start

dev: setup
    #!/usr/bin/env bash
    set -euo pipefail
    cleanup() {
        echo ""
        echo "shutting down JOHN dev servers..."
        kill $(jobs -p) 2>/dev/null || true
        wait 2>/dev/null || true
    }
    trap cleanup EXIT
    echo "starting backend..."
    cd backend && npx tsc && node dist/index.js &
    echo "starting frontend..."
    cd frontend && npm run dev &
    echo "both servers running — have fun!"
    wait

clean:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "cleaning up..."
    rm -rf prod
    echo "wiped clean, like it never happened"