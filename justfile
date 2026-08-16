check:
    #!/usr/bin/env bash
    set -euo pipefail
    command -v node >/dev/null 2>&1 || { echo "node not found — you need Node.js my dude"; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo "npm not found — you need npm my dude"; exit 1; }
    command -v sqlite3 >/dev/null 2>&1 || { echo "sqlite3 not found — you need sqlite3 my dude"; exit 1; }
    echo "prerequisites: ✅"

setup: check
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -f src/.env ]; then
        echo ".env already exists, skipping"
    else
        printf 'PORT=3000\nDATABASE=main.db\n' > src/.env
        echo "created src/.env"
    fi
    echo "initializing database..."
    db=$(grep '^DATABASE=' src/.env | cut -d= -f2)
    db=${db:-main.db}
    (cd src && sqlite3 "$db" < schema.sql)
    echo "database ready: $db"
    if [ ! -d src/node_modules ]; then
        echo "installing backend deps..."
        cd src && npm install
    fi

build: setup
    #!/usr/bin/env bash
    set -euo pipefail
    echo "building backend..."
    (cd src && npm run build) || { echo "backend build failed"; exit 1; }
    rm -rf prod
    cp -r src prod
    rm -rf prod/node_modules prod/.env
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
        echo "shutting down JOHN dev server..."
        kill $(jobs -p) 2>/dev/null || true
        wait 2>/dev/null || true
    }
    trap cleanup EXIT
    echo "starting backend..."
    cd src && npx tsc && node dist/index.js &
    echo "backend running — have fun!"
    wait

clean:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "cleaning up..."
    rm -rf prod
    echo "wiped clean, like it never happened"