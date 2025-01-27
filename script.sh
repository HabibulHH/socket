docker-compose down

docker-compose up -d --build

# To see the logs while running in detached mode
docker-compose logs -f

# To check the status of your containers
docker-compose ps

# If you need to stop the services
docker-compose down

$ docker exec -it socket-application-redis-1 redis-cli
docker exec -it socket-application-redis-1 redis-cli info clients