<template>
  <v-dialog max-width="500px" v-model="isVisible">
    <v-card>
      <v-card-title>
        <span>Login with Username/Password</span>
      </v-card-title>
      <v-card-text>
        <v-text-field
          type="text"
          @keyup.enter.native="localLogin"
          v-model="username"
          autofocus
          outlined
          label="Username"
        />
        <v-text-field
          @keyup.enter.native="localLogin"
          type="password"
          outlined
          v-model="password"
          label="Password"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="cancelLogin">Cancel</v-btn>
        <v-btn @click.native="localLogin" class="primary">Login</v-btn>
      </v-card-actions>
      <v-divider></v-divider>
      <v-card-title>
        <span>Login via Social Network</span>
      </v-card-title>
      <v-card-text class="d-flex justify-space-around">
        <v-btn fab class="ma-5" @click="hello.login('google')"
          ><v-icon>mdi-google</v-icon></v-btn
        >
        <v-btn fab class="ma-5" @click="hello.login('facebook')"
          ><v-icon>mdi-facebook</v-icon></v-btn
        >
      </v-card-text>
      <v-footer class="pa-3">
        <v-spacer></v-spacer>
        <router-link to="/privacy-policy">Privacy Policy</router-link>
      </v-footer>
    </v-card>
  </v-dialog>
</template>

<script>
import { Identity, LocalStorage } from "@/identity";

const LOG = window.console;

export default {
  name: "LoginDialog",
  props: [
    "isVisible",
    "hello", // injection point for "hellojs"
    "localAuth" // injectio point for the local auth lib
  ],
  data: () => ({
    username: "",
    password: "",
    identityStore: new LocalStorage("jwt")
  }),
  methods: {
    localLogin: function() {
      LOG.debug(`Requesting login for ${this.username}`);
      let prm = this.localAuth
        .loginUser(this.username, this.password)
        .then(data => {
          LOG.debug({ msg: "Received data from login", data: data });
          let identity = Identity.fromToken(this.identityStore, data.token);
          this.$emit("loginSuccessful", identity);

          // Reset text fields
          this.username = "";
          this.password = "";

          this.closeDialog();
        })
        .catch(error => {
          this.hello.logout("facebook");
          this.hello.logout("google");
          this.$emit("snackRequested", {
            text: error,
            color: "error",
            error: error
          });
          this.$store.commit("clearUserData");
          this.closeDialog();
        });
      return prm;
    },
    closeDialog: function() {
      this.username = "";
      this.password = "";
      this.$emit("dialogDismissed");
    },
    cancelLogin: function() {
      this.closeDialog();
    },
    login(provider) {
      this.hello(provider).login({
        scope: "basic, email"
      });
      this.$emit("dialogDismissed");
    }
  }
};
</script>
