
start dbfile port:
    @if [ ! -f {{dbfile}} ]; then \
        echo "Creating db..."; \
        just setupdb {{dbfile}}; \
    else \
        echo "DB exists"; \
    fi
    @cd frontend && bun run build && cd ..
    @DATABASE={{dbfile}} PORT={{port}} bun run backend/src/index.ts

setupdb dbfile:
    @cat schema.sql | sqlite3 {{dbfile}}
    @echo "Database Setup Complete (or should be)"

dev: 
    @just start database.db 8080

ship commit:
    @git add .
    @git commit -m "{{commit}}"
    @git push