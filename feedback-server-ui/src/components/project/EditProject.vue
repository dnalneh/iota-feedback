<template>
  <div>
    <b-modal v-model="showModal" size="sm" no-close-on-backdrop ok-only centered :title="modalHeader">
      <p class="my-4 text-center">{{ modalSubHeader }}</p>
      <p class="my-4 text-center">{{ modalText }}</p>
    </b-modal >
    <div v-if="showLoading" class="spinner">
      <img src="@/assets/loading.svg" alt="loading..."/>
    </div>   
    
    <h2>Edit your project<br /><small class="text-muted">{{getProp_name}}</small></h2>
    <br />
    <form @submit.prevent="validateBeforeSubmit" v-if="showContent" novalidate>
      <div class="form-group mb-3">
        <label for="exampleInput1">Name:</label>                    
        <input id="exampleInput1"                 
                name="name"
                type="text"
                v-model="project.name"
                v-validate="'required|max:100'"
                :class="{'is-invalid': errors.has('name'), 'form-control' : true }"                      
                placeholder="Enter name" />
        <div v-show="errors.has('name')" class="invalid-feedback m-1">{{ errors.first('name') }}</div>
      </div>    
      <div class="form-group mb-3">
        <label for="exampleInput2">Your description:</label>                   
        <b-textarea id="exampleInput2"
                      name="description"
                      :class="{'is-invalid': errors.has('description'), 'form-control' : true }"
                      type="text"
                      v-model="project.description"                      
                      v-validate="'max:500'" />
      
        <div v-show="errors.has('description')" class="invalid-feedback m-1">{{ errors.first('description') }}</div>
      </div>    
      <div class="form-group mb-3 outline-box">       
        <div class="form-check-label inline-box">Feedback paused:</div>  
        <div class="inline-box ml-5">
          <b-form-checkbox v-model="project.isPaused"></b-form-checkbox>
        </div>
      </div>
      <div class="form-group mb-3">
        <label for="exampleInput3">Your email for notifications:</label>                   
        <input id="exampleInput3"
                      name="email"
                      :class="{'is-invalid': errors.has('email'), 'form-control' : true }"
                      type="text"
                      v-model="project.notificationEmail"
                      value="{$auth.user.email}"
                      v-validate="'required|email'"
                      placeholder="Enter email for notifications" />
      
        <div v-show="errors.has('email')" class="invalid-feedback m-1">{{ errors.first('email') }}</div>
      </div>  

      <div class="float-right">    
        <b-button @click="helper.common.goTo('projects')" type="button" :disabled="buttonIsDisabled" variant="warning" class="mr-3">Cancel</b-button>
        <b-button type="submit" :disabled="errors.any() || buttonIsDisabled">Save changes</b-button>     
      </div>
    </form>
  </div>  
</template>

<script>
import Helper from "@/helper";

export default {
  name: "EditProject",
  props: ["domainId", "projectId", "name"],
  computed: {
    getProp_domainId: function() {
      return this.helper.storage.getProp("domainId");
    },
    getProp_projectId: function() {
      return this.helper.storage.getProp("projectId");
    },
    getProp_name: function() {
      return this.helper.storage.getProp("name");
    }
  },
  beforeMount: function() {
    this.showLoading = true;
    this.$http
      .get(
        "domains/" +
          this.getProp_domainId +
          "/projects/" +
          this.getProp_projectId
      )
      .then(response => {
        this.showLoading = false;
        switch (response.status) {
          case 200:
            this.project = response.data;
            this.showContent = true;
            break;
          case 404:
            this.helper.common.showModalMessage(response.data);
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
  methods: {
    validateBeforeSubmit() {
      this.$validator
        .validateAll()
        .then(result => {
          if (result) {
            this.showLoading = true;
            this.buttonIsDisabled = true;
            this.$http
              .put(
                "domains/" +
                  this.getProp_domainId +
                  "/projects/" +
                  this.getProp_projectId,
                this.project
              )
              .then(response => {
                this.showLoading = false;
                this.buttonIsDisabled = false;
                switch (response.status) {
                  case 204:
                    // Normal case, all ok
                    this.helper.common.goTo("projects");
                    break;
                  case 400:
                  case 404:
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

            return;
          } else {
            this.helper.common.handleInputError();
          }
        })
        .catch(() => {
          this.helper.common.handleInputError();
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
      project: {},
      buttonIsDisabled: false,
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.outline-box {
  margin: auto;
}
.inline-box {
  display: inline-block;
  vertical-align: middle;
}
</style>
