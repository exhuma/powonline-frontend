FROM node:20 AS build

ADD . /tmp/src
WORKDIR /tmp/src
RUN npm clean-install
RUN npm run build-only

FROM nginx:alpine AS webserver
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY deployment/config.json.template /etc/nginx/config.json.template
COPY deployment/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /tmp/src/dist/ /opt/powonline
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
