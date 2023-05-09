FROM node:20 as build

# These variables need to be defined to make them available during the build
# step (for vite). They must be provided by `docker build` if no `.env` file is
# present
ARG VITE_BACKEND_URL
ARG VITE_FACEBOOK_PUBLIC_KEY
ARG VITE_GOOGLE_PUBLIC_KEY
ARG VITE_NODE_ENV
ARG VITE_PAGE_TITLE
ARG VITE_PUSHER_DEBUG
ARG VITE_PUSHER_FILE_CHANNEL
ARG VITE_PUSHER_KEY
ARG VITE_PUSHER_TEAM_CHANNEL

ADD . /tmp/src
WORKDIR /tmp/src
RUN npm clean-install
RUN npm run build-only

FROM nginx:alpine as webserver
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/src/dist/ /opt/powonline
EXPOSE 80
