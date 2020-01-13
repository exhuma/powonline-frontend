import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import development from "@/config/development"
import production from "@/config/production"

Vue.config.productionTip = false

if (process.env.NODE_ENV === "production") {
  Vue.prototype.$config = Object.freeze(production)
} else {
  Vue.prototype.$config = Object.freeze(development)
}

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
