# powonline

> A Mobile & Web App for a local event

This repository serves as frontend for [powonline](https://github.com/exhuma/powonline)

## Build Setup

``` bash
# install dependencies
npm install

# Create local config files

The folder "config" contain several `.dist` files (like `pusher.env.js.dist`).

Copy those and remove the `.dist` extension and fill in your site-specific
details. The files are:

* `pusher.env.js` - Contains configuration values for pusher.com
* `siteSettings.env.js` - Contains configuration values your current
  development site.

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
