<template>
  <div>
     <b-modal v-model="showModal" size="sm" no-close-on-backdrop ok-only centered :title="modalHeader">
      <p class="my-4 text-center">{{ modalSubHeader }}</p>
      <p class="my-4 text-center">{{ modalText }}</p>
    </b-modal >
    <div v-if="showLoading" class="spinner">
      <img src="@/assets/loading.svg" alt="loading..."/>
    </div>

    <b-modal ref="askDeleteRef" centered title="Delete?" @ok="doDelete">
      <p class="my-4 text-center">Do you really want to delete your account and all it's data (projects, tickets, ...)?</p>     
    </b-modal>   
    
    <h2 class="float-left mb-5">Your account</h2>
    
    <b-btn v-if="!showLoading" class="float-right m-3" @click="askDelete('', user.email)"><i class="fa fa-trash-o mr-3"></i>Delete account</b-btn>
    

    <form @submit.prevent="validateBeforeSubmit" novalidate class="myclear" v-if="showContent">
      <div class="form-group mb-3">
        <label for="exampleInput1">Standard-Email for notifications (not for login):</label>                    
        <input id="exampleInput1"                 
                name="email"
                type="text"
                v-model="user.email"
                v-validate="'required|email'"
                :class="{'is-invalid': errors.has('email'), 'form-control' : true }"                      
                placeholder="Enter email" />
        <div v-show="errors.has('email')" class="invalid-feedback m-1">{{ errors.first('email') }}</div>
      </div>
      <div class="form-group mb-3">
        <label for="iotaseed">IOTA seed:</label>                    
        <input id="iotaseed"                 
                name="seed"
                autocomplete="off"
                type="text"
                v-model="user.iotaSeed"
                v-validate="{ regex: /(^$)|(^[9A-Z]{81}$)/ }"
                :class="{'is-invalid': errors.has('seed'), 'form-control' : true }"                      
                placeholder="Enter IOTA seed" />
        <div v-show="errors.has('seed')" class="invalid-feedback m-1">{{ errors.first('seed') }}</div>
      </div>  
      <div class="form-group mb-3">
        <label for="exampleInput3">IOTA node url: <br><small>You can take one from <a href="https://iota.dance" target="_blank">https://iota.dance</a> with enabled Pow, 
        <br/>default will be "{{helper.iota.getIOTAProvider()}}"</small></label>                    
        <input id="exampleInput3"                 
                name="node"
                type="text"
                v-model="user.iotaNode"
                v-validate="'url'"
                :class="{'is-invalid': errors.has('node'), 'form-control' : true }"                      
                placeholder="Enter IOTA node url" />
        <div v-show="errors.has('node')" class="invalid-feedback m-1">{{ errors.first('node') }}</div>
      </div>   
      <div class="float-right">    
        <b-button @click="helper.common.goTo('home')" type="button" :disabled="buttonIsDisabled" variant="warning" class="mr-3">Cancel</b-button>
        <b-button type="submit" :disabled="errors.any() || buttonIsDisabled">Save</b-button>     
      </div>
    </form>   
  </div>
</template>

<script>
import Helper from "@/helper";

export default {
  name: "Account",
  props: {},
  beforeMount: function() {
    this.loadData();
  },
  methods: {
    validateBeforeSubmit() {
      this.$validator
        .validateAll()
        .then(result => {
          if (result) {
            this.putUser();
          } else {
            this.helper.common.handleInputError();
          }
        })
        .catch(() => {
          this.helper.common.handleInputError();
        });
    },
    loadData() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .get("users")
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              this.user = response.data;
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
    putUser() {
      this.showLoading = true;
      this.buttonIsDisabled = true;
      this.$http
        .put("users", this.user)
        .then(response => {
          this.showLoading = false;
          this.buttonIsDisabled = false;
          switch (response.status) {
            case 204:
              // nice
              this.$router.push({
                name: "home"
              });
              break;
            case 400:
              this.helper.common.showModalMessage(response.data);
              break;
            default:
              this.helper.common.handleUnexpectedReturnCode(response);
              break;
          }
        })
        .catch(error => {
          this.showLoading = false;
          this.buttonIsDisabled = false;
          this.helper.common.handleNetworkError(error);
        });
    },
    askDelete(id, name) {
      this.currentTitle = name;
      this.$refs.askDeleteRef.show();
    },
    doDelete() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .delete("users")
        .then(response => {
          switch (response.status) {
            case 200:
              // deleted
              this.$auth.logout();
              break;
            default:
              this.showContent = true;
              this.showLoading = false;
              this.helper.common.handleUnexpectedReturnCode(response);
              break;
          }
        })
        .catch(error => {
          this.showContent = true;
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
      regexexpression: { regex: /(^$)|(^[9A-Z]{81}$)/ },
      user: {},
      buttonIsDisabled: false,
      currentTitle: "",
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#iotaseed {
  text-security: disc;
  -webkit-text-security: disc;
  -moz-text-security: disc;
}
</style>
