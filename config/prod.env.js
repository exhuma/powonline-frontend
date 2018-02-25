'use strict'
const merge = require('webpack-merge')
const siteSettings = require('./siteSettings.env')
const pusher = require('./pusher.env')
module.exports = merge({
  NODE_ENV: '"production"'
}, siteSettings, pusher)
