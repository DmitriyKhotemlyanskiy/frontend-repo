# Stage 1: Runner stage using lightweight Nginx
FROM alpine:3.19

# Install nginx
RUN apk add --no-cache nginx

# Copy custom nginx configuration if needed, or use default directory
# Copy frontend static code to nginx serving directory
COPY src/ /usr/share/nginx/html/

# Copy static assets to default location expected by alpine nginx packages
RUN mkdir -p /var/www/html && cp -r /usr/share/nginx/html/* /var/www/html/

# Simple configuration to run Nginx in the foreground
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Modify default config to point root to our assets
RUN sed -i 's|root /var/www/localhost/htdocs;|root /var/www/html;|g' /etc/nginx/http.d/default.conf

EXPOSE 80

CMD ["nginx"]