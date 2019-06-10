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
      <p class="my-4">Do you really want to delete the following domain and it's projects and data?</p>     
      <p class="my-4 font-weight-bold text-center">{{currentTitle}}</p>
    </b-modal>

    <h2 class="float-left mb-5">Manage your domains</h2>
    <router-link :to="{name: 'createdomain' }" v-if="!showLoading" class="float-right m-3">
        <b-btn><i class="fa fa-plus mr-3"></i>New domain</b-btn>
    </router-link>  

    <b-table :fields="dataFields" :items="domains" v-if="!showLoading" 
             empty-text="There are no domains yet - please add a new one!" show-empty 
             responsive outlined hover> 
      <!-- A custom formatted column -->
      <template slot="url" slot-scope="data">
        <h4 class="dont-break-out mb-2 d-inline">{{data.item.url}}</h4>              
         
        <div class="float-right">            
          <b-btn class="float-right mb-1 ml-3" @click="askDelete(data.item.id, data.item.url)"><i class="fa fa-trash-o mr-3"></i>Delete</b-btn>    
        </div>

        <div class="mt-2 mb-2 ml-4">
          <router-link class="h5 text-info" :to="{name: 'projects', params: { domainId: data.item.id,url: data.item.url } }">{{data.item.projects.length}} project{{data.item.projects.length != 1 ? 's' : ''}}</router-link>       
        </div> 
      </template>     
    </b-table>

  </div>  
</template>

<script>
import Helper from "@/helper";

export default {
  name: "Domains",
  beforeMount: function() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .get("domains")
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              this.domains = response.data;
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
    askDelete(id, url) {
      this.currentDeleteId = id;
      this.currentTitle = url;
      this.$refs.askDeleteRef.show();
    },
    doDelete() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .delete("domains/" + this.currentDeleteId)
        .then(response => {
          this.showLoading = false;
          this.currentDeleteId = undefined;
          switch (response.status) {
            case 200:
              // deleted
              this.loadData();
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
          this.currentDeleteId = undefined;
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
      dataFields: [{ key: "url", label: "Domain", sortable: true }],
      domains: [],
      currentTitle: "",
      currentDeleteId: undefined,
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
