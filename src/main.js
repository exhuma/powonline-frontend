import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import development from "@/config/development"
import production from "@/config/production"
import VueRouter from 'vue-router'
import routes from "@/router"

Vue.config.productionTip = false
Vue.use(VueRouter)

if (process.env.NODE_ENV === "production") {
  Vue.prototype.$config = Object.freeze(production)
} else {
  Vue.prototype.$config = Object.freeze(development)
}

const router = new VueRouter({
  mode: 'history',
  routes
})

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
