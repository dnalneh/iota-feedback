import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import VeeValidate from 'vee-validate'
import auth from '@/auth'
import axios from 'axios'
import constants from './constants'

const veeValidateconfig = {
  fieldsBagName: 'felder'
};

const API_SERVER_DOMAIN = constants.BASE_URL + '/api/v1.0/'
axios.defaults.baseURL = API_SERVER_DOMAIN;
axios.defaults.validateStatus = function (status) {
  return true; // never reject (==fire catch), no matter which status code
};
// 2 of 2 - On refresh: Set Authorization header for axios (= $http) calls automatically for every request (if expired login than login dialog will pop up automatically)
axios.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem('access_token');

Vue.prototype.$http = axios;
Vue.use(BootstrapVue);
Vue.use(VeeValidate, veeValidateconfig);
Vue.use(auth);

Vue.config.productionTip = false

window.app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
