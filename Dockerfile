#FROM nginx:stable-alpine3.23
#
##Make a work dirrectory
#WORKDIR /usr/share/nginx/html
#
##Copy frontend-app from /src dir to WORKDIR
#COPY /src .
#
##Open port 80 for serving
#EXPOSE 80
#
##Run Nginx in the foreground
#CMD ["nginx", "-g", "daemon off;"]
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy all local project files into the container's working directory
COPY /src .

#  Connection to backend-app url
ENV API_URL=http://localhost:8085

# Expose port 3000 to allow network traffic to the container
EXPOSE 3000

# Run Python's unbuffered http.server on port 3000 serving from the /app directory
CMD ["sh", "-c", "echo \"{\\\"API_BASE_URL\\\": \\\"$API_URL\\\"}\" > config.json && python -u -m http.server 3000"]