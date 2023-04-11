#!/bin/bash
set -xe

npm clean-install
cp .config/pusher.env.js.dist .config/pusher.env.js
cp .config/siteSettings.env.js.dist .config/siteSettings.env.js