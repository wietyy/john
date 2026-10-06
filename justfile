
start pg port:
    @cd frontend && bun run build
    @POSTGRES="{{pg}}" PORT={{port}} bun run backend/src/index.ts
    
dev pg: 
    @just start "{{pg}}" 3000

ship commit:
    @git add .
    @git commit -m "{{commit}}"
    @git push