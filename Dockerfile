FROM nginx:stable-alpine3.23

#Make a work dirrectory
WORKDIR /usr/share/nginx/html

#Copy frontend-app from /src dir to WORKDIR
COPY /src .

#Open port 80 for serving
EXPOSE 80

#Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
