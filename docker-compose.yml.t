#version: "3.9"       # Opcional, Docker Compose lo detecta automáticamente

services:
  db:
    image: postgres:15          # ✔ necesario
    restart: always             # ✔ recomendable
    environment:                # ✔ necesario si quieres configurar usuario, contraseña y base de datos
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"             # ✔ necesario para exponer el puerto
    volumes:
      - db_data:/var/lib/postgresql/data  # ✔ necesario si quieres persistencia


  backend:
    build:
      context: .
      dockerfile: .Dockerfile   # ✔ necesario si estás construyendo tu app
    ports:
      - "8000:2000"             # ✔ necesario si quieres exponer tu app
    environment:
      DB_DSN: postgresql://postgres:Crismpc2808@db.wznhvwnwgdnkercrvhtv.supabase.co:5432/postgres?sslmode=require        # ✔ necesario para la conexión a la DB
    depends_on:
      - db                      # ✔ asegura que la DB se inicie antes que el backend
    env_file:
      - .env

volumes:
  db_data:                      # ✔ necesario para la persistencia
