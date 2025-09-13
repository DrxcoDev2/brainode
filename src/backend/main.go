package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
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
	Password string `json:"password,omitempty"` // omitimos en JSON de GET
}

var dbpool *pgxpool.Pool

func main() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatalf("Error al cargar .env: %v", err)
	}

	dsn := os.Getenv("DB_DSN")
	dbpool, err = pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("Error al conectar a la DB: %v", err)
	}
	defer dbpool.Close()

	fmt.Println("Conectado a la base de datos")
	createTable(dbpool)

	// Router con Gorilla Mux
	r := mux.NewRouter()
	r.HandleFunc("/users", getUsersHandler).Methods("GET")
	r.HandleFunc("/users", createUserHandler).Methods("POST")
	r.HandleFunc("/users/{id}", updateUserHandler).Methods("PUT")
	r.HandleFunc("/users/{id}", deleteUserHandler).Methods("DELETE")

	fmt.Println("Servidor escuchando en http://localhost:2000")
	log.Fatal(http.ListenAndServe(":2000", r))
}

// Crear tabla si no existe
func createTable(db *pgxpool.Pool) {
	_, err := db.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL
		)
	`)
	if err != nil {
		log.Fatalf("Error creando tabla: %v", err)
	}
	fmt.Println("Tabla 'users' lista")
}

// GET /users
func getUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := dbpool.Query(context.Background(), "SELECT id, name, email FROM users") // no traemos password
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

// POST /users
func createUserHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Datos inv�lidos", http.StatusBadRequest)
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

// PUT /users/{id}
func updateUserHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inv�lido", http.StatusBadRequest)
		return
	}

	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Datos inv�lidos", http.StatusBadRequest)
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

// DELETE /users/{id}
func deleteUserHandler(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inv�lido", http.StatusBadRequest)
		return
	}

	_, err = dbpool.Exec(context.Background(),
		"DELETE FROM users WHERE id=$1", id)
	if err != nil {
		http.Error(w, "Error borrando usuario", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuario eliminado"})
}
