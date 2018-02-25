'use strict'
const merge = require('webpack-merge')
const siteSettings = require('./siteSettings.env')
const pusher = require('./pusher.env')
module.exports = merge({
  NODE_ENV: '"production"',
  BACKEND_URL: '"https://powonline-api.albert.lu"'
}, pusher)
