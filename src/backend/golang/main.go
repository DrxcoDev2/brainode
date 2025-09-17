package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

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

type Conversation struct {
    ID        int       `json:"id"`
    UserID    int       `json:"user_id"`
    Model     string    `json:"model"`
    CreatedAt time.Time `json:"created_at"`
}

var dbpool *pgxpool.Pool

func main() {
	// Cargar variables de entorno
	err := godotenv.Load("./.env")
	if err != nil {
		log.Fatalf("Error al cargar .env: %v", err)
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN no está configurado (revisa tu .env o variables de entorno)")
	}

	// Analizar DSN para extraer host/puerto (necesario para SNI y fallback a IP)
	u, err := url.Parse(dsn)
	if err != nil {
		log.Fatalf("DB_DSN inválido: %v", err)
	}
	host := u.Hostname()
	port := u.Port()
	if port == "" {
		port = "5432"
	}

	// Permitir override por variable de entorno (evita depender del DNS del sistema)
	forcedIPv4 := os.Getenv("DB_HOST_IPV4")
	var resolvedIPv4 string
	if forcedIPv4 != "" {
		resolvedIPv4 = forcedIPv4
		fmt.Printf("Usando DB_HOST_IPV4=%s\n", resolvedIPv4)
	} else {
		// Intentar resolver IPv4
		resCtx, resCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer resCancel()
		ips, err := net.DefaultResolver.LookupIP(resCtx, "ip4", host)
		if err == nil && len(ips) > 0 {
			resolvedIPv4 = ips[0].String()
		} else if err != nil {
			log.Printf("Aviso: no se pudo resolver IPv4 para %s: %v", host, err)
		}
	}

	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("Error parseando DB_DSN: %v", err)
	}

	// Asegurar SNI para el certificado de Supabase
	if cfg.ConnConfig.TLSConfig == nil {
		cfg.ConnConfig.TLSConfig = &tls.Config{}
	}
	cfg.ConnConfig.TLSConfig.ServerName = host

	// Fuerza conexiones IPv4; si tenemos IPv4 resuelta/proporcionada, dial directo a esa IP
	cfg.ConnConfig.DialFunc = func(ctx context.Context, network, addr string) (net.Conn, error) {
		d := &net.Dialer{Timeout: 5 * time.Second}
		if resolvedIPv4 != "" {
			return d.DialContext(ctx, "tcp4", net.JoinHostPort(resolvedIPv4, port))
		}
		return d.DialContext(ctx, "tcp4", addr)
	}

	dbpool, err = pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		log.Fatalf("Error creando pool de conexiones: %v", err)
	}
	defer dbpool.Close()

	// Verificar la conexión antes de continuar
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := dbpool.Ping(ctx); err != nil {
		log.Fatalf("No se pudo conectar a la DB: %v", err)
	}

	fmt.Println("Conectado a la base de datos")
	createTable(dbpool)
	createTableConversations(dbpool)

	// Router con Gorilla Mux
	r := mux.NewRouter()

	// Middleware CORS
	r.Use(middlewareCORS)

	// Rutas
	r.HandleFunc("/users", getUsersHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/users", createUserHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/users/{id}", updateUserHandler).Methods("PUT", "OPTIONS")
	r.HandleFunc("/users/{id}", deleteUserHandler).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/login", loginHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/conversations", getConversationsHandler).Methods("GET", "OPTIONS")
	//r.HandleFunc("/conversations", createConversationHandler).Methods("POST", "OPTIONS")
	//r.HandleFunc("/conversations/{id}", updateConversationHandler).Methods("PUT", "OPTIONS")
	//r.HandleFunc("/conversations/{id}", deleteConversationHandler).Methods("DELETE", "OPTIONS")

	fmt.Println("Servidor escuchando en http://localhost:2000")
	log.Fatal(http.ListenAndServe(":2000", r))
}

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

	// Buscar usuario por email
	var user User
	err := dbpool.QueryRow(context.Background(),
		"SELECT id, name, email, password FROM users WHERE email=$1", creds.Email).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password)

	if err != nil {
		http.Error(w, "Email o contrase�a incorrectos", http.StatusUnauthorized)
		return
	}

	// Comprobar contrase�a
	if creds.Password != user.Password {
		http.Error(w, "Email o contrase�a incorrectos", http.StatusUnauthorized)
		return
	}

	// Login correcto
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login exitoso",
		"name":    user.Name,
		"email":   user.Email,
	})
}


func middlewareCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Permitir tu frontend
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Responder preflight
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
		)
	`)
	if err != nil {
		log.Fatalf("Error creando tabla: %v", err)
	}
	fmt.Println("Tabla 'users' lista")
}

//Crear tabla de conversaciones si no existe
func createTableConversations(db *pgxpool.Pool) {
	_, err := db.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS conversations (
			id SERIAL PRIMARY KEY,
			user_id INT NOT NULL,
			model TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)
	`)
	if err != nil {
		log.Fatalf("Error creando tabla: %v", err)
	}
	fmt.Println("Tabla 'conversations' lista")
}

// GET /users
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

// GET /conversations
func getConversationsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := dbpool.Query(context.Background(), "SELECT id, user_id, model, created_at FROM conversations")
	if err != nil {
		http.Error(w, "Error leyendo usuarios", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var conversations []Conversation
	for rows.Next() {
		var u Conversation
		if err := rows.Scan(&u.ID, &u.UserID, &u.Model, &u.CreatedAt); err != nil {
			http.Error(w, "Error leyendo usuarios", http.StatusInternalServerError)
			return
		}
		conversations = append(conversations, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversations)

}