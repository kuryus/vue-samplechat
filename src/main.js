import firebase from "firebase"
import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

// Initialize Firebase
var config = {
  apiKey: "APIKEY",
  authDomain: "simplechat-e879f.firebaseapp.com",
  databaseURL: "https://simplechat-e879f.firebaseio.com",
  projectId: "simplechat-e879f",
  storageBucket: "simplechat-e879f.appspot.com",
  messagingSenderId: "1017518629106"
};
firebase.initializeApp(config);

new Vue({
  render: h => h(App)
}).$mount("#app");
