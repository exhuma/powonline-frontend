# powonline

> A Mobile & Web App for a local event

This repository serves as frontend for [powonline](https://github.com/exhuma/powonline)

## Build Setup

```bash
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

## Deployment

We use the Python task runner "invoke" to automate deployment. You need to
install `invoke`, `fabric` and `patchwork` for this to work:

```
pip install --user -U invoke fabric patchwork
```

To build the docker container run:

- `inv build_docker -e prod`

This will build the JS package for production, send it to the remote server and
build the docker image on that host. Building remotely is necessary as I
currently have a slow connection which makes building locally and uploading the
image to a registry unfeasible.

- Create copies of `api.env.dist` and `frontend.env.dist` (removing the `.dist`
  suffix). Modify the values as necessary.

Once this is done, run `inv deploy -e prod`

### Configuration & Social Logins

The application keeps site-config in the `static/config` folder. This folder
contains site-specific settings and can (and likely should) be mounted as
volume in docker containers.
