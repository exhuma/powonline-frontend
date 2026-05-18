#!/bin/sh
# Entrypoint for the frontend nginx container.
#
# Writes /opt/powonline/config.json from environment variables using envsubst,
# then hands off to nginx.
#
# Required environment variables:
#   BACKEND_URL  — fully-qualified URL of the powonline API
#                  e.g. https://api.example.com
set -e

: "${BACKEND_URL:?BACKEND_URL must be set}"

envsubst < /etc/nginx/config.json.template > /opt/powonline/config.json

exec nginx -g 'daemon off;'
