#!/bin/bash

# Run the Docker container
docker run -d -p 3000:3000 --name it-helpdesk-test it-helpdesk:latest

# Wait for the application to start
sleep 10

# Run system tests
curl -f http://localhost:3000 || exit 1

# Stop and remove the container
docker stop it-helpdesk-test
docker rm it-helpdesk-test
