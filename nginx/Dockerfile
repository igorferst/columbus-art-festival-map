FROM nginx:1.9.10
MAINTAINER Rational Form Ltd.

COPY public/ /usr/local/nginx/public
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY mime.types /etc/nginx/mime.types
COPY nginx.key /etc/nginx/ssl/nginx.key
COPY nginx.crt /etc/nginx/ssl/nginx.crt
