'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const siteSettings = require('./siteSettings.env')
const pusher = require('./pusher.env')
const withoutsiteSettings = merge(prodEnv, {
  NODE_ENV: '"development"',
})

module.exports = merge(withoutsiteSettings, siteSettings, pusher)
