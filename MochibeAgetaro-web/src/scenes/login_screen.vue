<template>
  <v-app>
    <v-main>
      <v-card
        elevation="4"
        outlined
        width="400"
        style="margin: 10px auto;"
      >
        <v-card-title>
          ログイン
        </v-card-title>
        <div id="firebaseui-auth-container"></div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script>
  import firebase from 'firebase/app';
  import "firebase/auth";
  const firebaseui = require("firebaseui-ja");
  require("firebaseui-ja/dist/firebaseui.css");

  import axios from "axios";
  import api_server from '../../apiserverpath';

  export default {
    name: "Login",
    methods: {
      // firebaseによる認証成功時
      signInSuccessWithAuthResult: async function(authResult){
        // idTokenを取得
        const idToken = await firebase.auth().currentUser.getIdTokenResult(true);
        // idTokenの検証を行う
        const response = await axios.post(api_server.path + "/verify", {
          token: idToken.token
        });
        if(response.status === 200){
          // 検証が上手くいったら, 色々やって次の画面に遷移
          this.$store.dispatch("fetch", authResult.user.displayName);
          this.$router.push("/"/*this.$route.query.redirect*/);
        }else{
          // 検証が上手くいかなかったら, サインアウト
          firebase.auth().signOut();
        }
      },
    },
    data(){
      return{
        uiConfig: {
          callbacks: {
            signInSuccessWithAuthResult: this.signInSuccessWithAuthResult,
          },
          signInFlow: 'redirect',
          signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
        }
      };
    },
    created: function(){
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start('#firebaseui-auth-container', this.uiConfig);
    }
  }
</script>