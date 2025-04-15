#!/bin/bash

# Stop and remove any existing container
docker stop it-helpdesk-test || true
docker rm it-helpdesk-test || true

# Run the Docker container
docker run -d -p 5000:5000 --name it-helpdesk-test it-helpdesk:latest

# Wait for the application to start
sleep 10

# Run system tests
curl -f http://localhost:5000 || exit 1

# Stop and remove the container
docker stop it-helpdesk-test
docker rm it-helpdesk-test
