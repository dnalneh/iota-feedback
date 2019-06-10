<template>
  <div>
    <b-modal v-model="showModal" size="sm" no-close-on-backdrop ok-only centered :title="modalHeader">
      <p class="my-4 text-center">{{ modalSubHeader }}</p>
      <p class="my-4 text-center">{{ modalText }}</p>
    </b-modal >   
    <div v-if="showLoading" class="spinner">
      <img src="@/assets/loading.svg" alt="loading..."/>
    </div>

    <h2>Add new domain</h2>
    <br />
     <form @submit.prevent="validateBeforeSubmit" novalidate>
     
      <div class="form-group mb-3" v-if="isLocal">
        --- Development mode - localhost:8081 is allowed to enter ---<br><br>
        <label for="exampleInput1">Domain:</label>                    
        <input id="exampleInput1"                 
                name="url"
                type="text"
                v-model="domain.url"
                v-validate="'required'"
                :class="{'is-invalid': errors.has('url'), 'form-control' : true }"                      
                placeholder="Enter domain" />
        <div v-show="errors.has('url')" class="invalid-feedback m-1">{{ errors.first('url') }}</div>
      </div>
      <div class="form-group mb-3" v-else>
        <label for="exampleInput1">Domain:</label>                    
        <input id="exampleInput1"                 
                name="url"
                type="text"
                v-model="domain.url"
                v-validate="'required|url'"
                :class="{'is-invalid': errors.has('url'), 'form-control' : true }"                      
                placeholder="Enter domain" />
        <div v-show="errors.has('url')" class="invalid-feedback m-1">{{ errors.first('url') }}</div>
      </div>   

      <div class="float-right">    
        <b-button @click="helper.common.goTo('domains')" type="button" :disabled="buttonIsDisabled" variant="warning" class="mr-3">Cancel</b-button>
        <b-button type="submit" :disabled="errors.any() || buttonIsDisabled">Save</b-button>     
      </div>
    </form>
  </div>  
</template>

<script>
import Helper from "@/helper";

export default {
  name: "CreateDomain",
  methods: {
    validateBeforeSubmit() {
      this.$validator
        .validateAll()
        .then(result => {
          if (result) {
            this.create();
          } else {
            this.helper.common.handleInputError();
          }
        })
        .catch(() => {
          this.helper.common.handleInputError();
        });
    },
    create() {
      this.showLoading = true;
      this.buttonIsDisabled = true;
      this.$http
        .post("domains", this.domain)
        .then(response => {
          this.showLoading = false;
          this.buttonIsDisabled = false;
          switch (response.status) {
            case 201:
              this.helper.common.goTo("domains");
              break;
            case 400:
            case 409:
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
    }
  },
  data: function() {
    return {
      modalHeader: "",
      modalSubHeader: "",
      modalText: "",
      showModal: false,
      showLoading: false,
      isLocal: window.location.host === "localhost:8080",
      domain: { url: "", notificationEmail: this.$auth.user.email },
      buttonIsDisabled: false,
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
