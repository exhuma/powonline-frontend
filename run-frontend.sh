#!/bin/bash
docker run \
    -d \
    --env VIRTUAL_HOST=powonline.albert.lu \
    --env LETSENCRYPT_HOST=powonline.albert.lu \
    --env LETSENCRYPT_EMAIL=michel@albert.lu \
    exhuma/powonline-frontend:latest
