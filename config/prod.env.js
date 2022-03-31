"use strict";
const merge = require("webpack-merge");
const pusher = require("./pusher.env");
module.exports = merge(
  {
    NODE_ENV: '"production"',
    BACKEND_URL: '"https://powonline-api.albert.lu"',
    PUSHER_DEBUG: "false",
    PUSHER_TEAM_CHANNEL: '"team-station-state"',
    PUSHER_FILE_CHANNEL: '"file-events"',
  },
  pusher
);
