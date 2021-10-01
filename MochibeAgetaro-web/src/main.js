import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from "./plugins/router";
import store from './plugins/store';
import croppa from "vue-croppa";
// import "vue-croppa/dist/vue-croppa.css";
import firebase from 'firebase/app';
import firebaseConfig from '../firebaseconfig';

Vue.config.productionTip = false;

//initialize firebase
firebase.initializeApp(firebaseConfig);

new Vue({
  vuetify,
  router,
  store,
  croppa,
  render: h => h(App),
}).$mount('#app');
