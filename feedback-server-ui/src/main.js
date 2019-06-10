import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import VeeValidate from 'vee-validate'
import auth from '@/auth'
import axios from 'axios'
import config from './config'

axios.defaults.baseURL = config.WEB_API_URL;
axios.defaults.validateStatus = function (status) {
  return true; // never reject (==fire catch), no matter which status code
};
// 2 of 2 - On refresh: Set Authorization header for axios (= $http) calls automatically for every request (if expired login than login dialog will pop up automatically)
axios.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem('access_token');

Vue.prototype.$http = axios;
Vue.use(BootstrapVue);
Vue.use(VeeValidate, {
  fieldsBagName: 'felder'
});
Vue.use(auth);

Vue.config.productionTip = false

window.app = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
