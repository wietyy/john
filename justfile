
start pg port:
    @cd frontend && bun run build
    @POSTGRES="{{pg}}" PORT={{port}} bun run backend/src/index.ts

setupdb dbfile:
    @cat schema.sql | sqlite3 {{dbfile}}
    @echo "Database Setup Complete (or should be)"

dev pg: 
    @just start "{{pg}}" 3000

ship commit:
    @git add .
    @git commit -m "{{commit}}"
    @git push