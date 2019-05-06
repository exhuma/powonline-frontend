'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const siteSettings = require('./siteSettings.env')
const pusher = require('./pusher.env')
const oauth = require('./oauth.env')
const withoutsiteSettings = merge(prodEnv, {
  NODE_ENV: '"development"',
  PUSHER_TEAM_CHANNEL: '"team-station-state-dev"',
  PUSHER_FILE_CHANNEL: '"file-events-dev"'
})

module.exports = merge(withoutsiteSettings, siteSettings, pusher, oauth)
