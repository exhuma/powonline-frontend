import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#ce0000',
          accent: '#d8ee00',
          error: '#b71c1c',
          success: '#00ce00'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi'
  }
})
