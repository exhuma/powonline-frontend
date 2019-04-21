'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const siteSettings = require('./siteSettings.env')
const pusher = require('./pusher.env')
const oauth = require('./oauth.env')
const withoutsiteSettings = merge(prodEnv, {
  NODE_ENV: '"development"',
  PUSHER_CHANNEL: '"team-station-state-dev"'
})

module.exports = merge(withoutsiteSettings, siteSettings, pusher, oauth)
