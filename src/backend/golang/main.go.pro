package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// User representa un usuario
type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
}

var dbpool *pgxpool.Pool

func main() {
	// Cargar variables de entorno localmente
	_ = godotenv.Load("../../.env")

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN no está definido")
	}

	// Configuración pgx con soporte SSL y IPv4
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("Error parseando DSN: %v", err)
	}

	// Forzar IPv4
	config.ConnConfig.DialFunc = func(ctx context.Context, network, addr string) (net.Conn, error) {
		return (&net.Dialer{}).DialContext(ctx, "tcp4", addr)
	}

	dbpool, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Error conectando a la DB: %v", err)
	}

	defer dbpool.Close()

	fmt.Println("Conectado a la base de datos")
	createTable(dbpool)

	r := mux.NewRouter()
	r.Use(middlewareCORS) // CORS para frontend

	// Rutas
	r.HandleFunc("/users", getUsersHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/users", createUserHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/users/{id}", updateUserHandler).Methods("PUT", "OPTIONS")
	r.HandleFunc("/users/{id}", deleteUserHandler).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/login", loginHandler).Methods("POST", "OPTIONS")

	fmt.Println("Servidor escuchando en http://localhost:2000")
	log.Fatal(http.ListenAndServe(":2000", r))
}

// Login handler
func loginHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	w.Header().Set("Content-Type", "application/json")

	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Datos invalidos", http.StatusBadRequest)
		return
	}

	var user User
	err := dbpool.QueryRow(context.Background(),
		"SELECT id, name, email, password FROM users WHERE email=$1", creds.Email).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password)

	if err != nil || creds.Password != user.Password {
		http.Error(w, "Email o contraseña incorrectos", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login exitoso",
		"name":    user.Name,
		"email":   user.Email,
	})
}

// Middleware CORS
func middlewareCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Ajustar en producción
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Crear tabla si no existe
func createTable(db *pgxpool.Pool) {
	_, err := db.Exec(context.Background(), `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL
	)`)
	if err != nil {
		log.Fatalf("Error creando tabla: %v", err)
	}
	fmt.Println("Tabla 'users' lista")
}

// CRUD Handlers
func getUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := dbpool.Query(context.Background(), "SELECT id, name, email FROM users")
	if err != nil {
		http.Error(w, "Error leyendo usuarios", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {
			http.Error(w, "Error leyendo usuarios", http.StatusInternalServerError)
			return
		}
		users = append(users, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func createUserHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	_, err := dbpool.Exec(context.Background(),
		"INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", u.Name, u.Email, u.Password)
	if err != nil {
		http.Error(w, "Error insertando usuario", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuario creado"})
}

func updateUserHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	_, err = dbpool.Exec(context.Background(),
		"UPDATE users SET name=$1, email=$2, password=$3 WHERE id=$4", u.Name, u.Email, u.Password, id)
	if err != nil {
		http.Error(w, "Error actualizando usuario", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuario actualizado"})
}

func deleteUserHandler(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	_, err = dbpool.Exec(context.Background(), "DELETE FROM users WHERE id=$1", id)
	if err != nil {
		http.Error(w, "Error borrando usuario", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuario eliminado"})
}
