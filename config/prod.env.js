'use strict'
const merge = require('webpack-merge')
const pusher = require('./pusher.env')
const oauth = require('./oauth.env')
module.exports = merge({
  NODE_ENV: '"production"',
  BACKEND_URL: '"https://lost2018-api.albert.lu"',
  PUSHER_DEBUG: 'false',
  PUSHER_CHANNEL: '"team-station-state"'
}, pusher, oauth)
