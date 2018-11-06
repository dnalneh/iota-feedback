<template>
  <div>
    <b-modal v-model="showModal" size="sm" no-close-on-backdrop ok-only centered :title="modalHeader">
      <p class="my-4 text-center">{{ modalSubHeader }}</p>
      <p class="my-4 text-center">{{ modalText }}</p>
    </b-modal >
    <div v-if="showLoading" class="spinner">
      <img src="@/assets/loading.svg" alt="loading..."/>
    </div>

    <div v-if="!showLoading">
      <b-card :title="'Welcome ' + $auth.user.email + '!'"
            img-src="unsplash.jpg"
            img-alt=""
            img-top>
        <p class="card-text float-left">
          Our feedback tool allows you to easily discuss and improve your website design together with your collaborators or customers.
          In order to use <b>this</b>, you first need to register your domain(s).
        </p>
        <router-link :to="{name: 'createdomain' }" v-if="!showLoading" class="float-right m-3">
            <b-btn><i class="fa fa-plus mr-3"></i>New domain</b-btn>
        </router-link>
        <div class="myclear">
          <br />
          <b-alert fade variant="danger" class="mt-3 mr-5 d-inline-block" :show="welcomeData.numberOfUnviewedTickets > 0">You have got {{welcomeData.numberOfUnviewedTickets}} new ticket{{(welcomeData.numberOfUnviewedTickets> 1) ? "s" : ""}}!</b-alert>
          <b-alert fade variant="danger" class="d-inline-block" :show="welcomeData.numberOfUnviewedSelections > 0">You have got {{welcomeData.numberOfUnviewedSelections}} new selection{{(welcomeData.numberOfUnviewedSelections> 1) ? "s" : ""}}!</b-alert>
        </div>
      </b-card>      
    </div>
  </div>
  
</template>

<script>
import Helper from "@/helper";

export default {
  name: "Welcome",
  beforeMount: function() {
    this.checkIfUserExists();
  },
  methods: {
    checkIfUserExists() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .get("users")
        .then(response => {
          switch (response.status) {
            case 200:
              // all fine
              this.getWelcomeData();
              break;
            case 404:
              // create user
              this.createUser();
              break;
            default:
              this.helper.common.handleUnexpectedReturnCode(response);
              break;
          }
        })
        .catch(error => {
          this.showLoading = false;
          this.helper.common.handleNetworkError(error);
        });
    },
    createUser() {
      this.$http
        .post("users", {
          email: this.$auth.user.email
        })
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 201:
              // user created, ready to use
              this.showContent = true;
              break;
            default:
              this.helper.common.handleUnexpectedReturnCode(response);
              break;
          }
        })
        .catch(error => {
          this.showLoading = false;
          this.helper.common.handleNetworkError(error);
        });
    },
    getWelcomeData() {
      this.$http
        .get("users/welcomedata")
        .then(response => {
          switch (response.status) {
            case 200:
              // all fine
              this.welcomeData = response.data;
              this.showLoading = false;
              this.showContent = true;
              break;
            default:
              this.helper.common.handleUnexpectedReturnCode(response);
              break;
          }
        })
        .catch(error => {
          this.showLoading = false;
          this.helper.common.handleNetworkError(error);
        });
    }
  },
  data: function() {
    return {
      modalHeader: "",
      modalSubHeader: "",
      modalText: "",
      showModal: false,
      showLoading: true,
      showContent: false,
      welcomeData: {},
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
