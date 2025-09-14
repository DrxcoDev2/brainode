# ---- Etapa de build ----
    FROM golang:1.24.5 AS builder

    WORKDIR /app
    

    COPY src/backend/go.mod src/backend/go.sum ./
    RUN go mod download
    

    COPY src/backend/ ./ 

    RUN go build -o server .
    
    FROM debian:bookworm-slim
    
    WORKDIR /app
    
    COPY --from=builder /app/server .
    
    EXPOSE 2000
    
    
    CMD ["./server"]
    