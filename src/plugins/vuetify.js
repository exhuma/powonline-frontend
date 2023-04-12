import Vue from 'vue'
import Vuetify from 'vuetify/dist/vuetify.js'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#ce0000',
        accent: '#d8ee00',
        error: '#b71c1c',
        success: '#00ce00'
      }
    }
  },
  icons: {
    iconfont: 'mdi'
  }
})
