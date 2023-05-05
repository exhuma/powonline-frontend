FROM node:20 as build
ADD . /tmp/src
WORKDIR /tmp/src
RUN npm clean-install
RUN npm run build-only

FROM nginx:alpine as webserver
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/src/dist/ /opt/powonline
EXPOSE 80
