import {createApp} from 'vue'
import App from '../vue/login.vue'

// Vuetify
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import {aliases, mdi} from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '../css/main.css'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    },
    components,
    directives
})

const app = createApp(App)
const rbsmLoginForm = document.querySelector('#rbsm-login');
if (rbsmLoginForm) {
    app.use(vuetify)
    app.mount('#rbsm-login');
}