#!/bin/bash
# reset_docker.sh


set -e

echo "1\ufe0f\u20e3 Deteniendo y eliminando contenedores antiguos..."
docker-compose down

echo "2\ufe0f\u20e3 Eliminando contenedores colgantes (si hay)..."
docker ps -a -q | xargs -r docker rm -f

echo "3\ufe0f\u20e3 Limpiando redes Docker no usadas..."
docker network prune -f

echo "4\ufe0f\u20e3 Limpiando vol�menes anonimos no usados (opcional)..."
docker volume prune -f

echo "5\ufe0f\u20e3 Construyendo y levantando contenedores limpios..."
docker-compose up -d --build

echo "\u2705 Todo listo. Contenedores corriendo:"
docker ps
