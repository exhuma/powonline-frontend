# =============================================================================
# Stage 1 — build
#   Install Node dependencies and compile the Vite/Vue application.
#   Uses node:20-alpine to keep the build layer small and reproducible.
# =============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Layer-cache dependencies: copy manifests first so this layer is only
# invalidated when dependencies actually change.
COPY package.json package-lock.json ./
RUN npm clean-install

# Copy the rest of the source and build the production bundle.
# Pass the Git commit SHA at build time so it can be inlined into the bundle:
#   docker build --build-arg COMMIT_SHA=$(git rev-parse HEAD) .
ARG COMMIT_SHA=unknown
ENV VITE_COMMIT_SHA=${COMMIT_SHA}
COPY . .
RUN npm run build-only

# =============================================================================
# Stage 2 — runtime
#   Serve the compiled static assets with nginx.
#   Runs entirely as the unprivileged nginx user on port 8080.
# =============================================================================
FROM nginx:1.27-alpine AS runtime

# Remove the default nginx server config and replace with ours.
RUN rm /etc/nginx/conf.d/default.conf
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# Runtime config template (rendered into the webroot by the entrypoint).
COPY deployment/config.json.template /etc/nginx/config.json.template

# Custom entrypoint that injects BACKEND_URL and then starts nginx.
COPY deployment/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy compiled assets from the build stage.
COPY --from=build /app/dist /opt/powonline

# Allow the nginx user to write config.json into the webroot at startup,
# and grant access to the nginx runtime temp/pid directories.
RUN chown -R nginx:nginx /opt/powonline \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Drop privileges.
USER nginx

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
