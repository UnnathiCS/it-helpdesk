# Use a Node.js base image
FROM node:16

# Set the working directory
WORKDIR /it-helpdesk

# Copy the backend package.json and package-lock.json
COPY backend/package*.json ./backend/

# Navigate to the backend directory and install dependencies
WORKDIR /it-helpdesk/backend
RUN npm install

# Copy the backend application code
COPY backend/ .

# Copy the frontend directory
WORKDIR /it-helpdesk
COPY frontend/ ./frontend/

# Expose the application port
EXPOSE 5000

# Start the application
WORKDIR /it-helpdesk/backend
CMD ["npm", "start"]
