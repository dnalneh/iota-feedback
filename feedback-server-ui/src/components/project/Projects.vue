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
      <p class="my-4">Do you really want to delete the following project and it's data?</p>     
      <p class="my-4 font-weight-bold text-center">{{currentTitle}}</p>
    </b-modal>

    <h2 class="float-left mb-5">Manage projects of domain<br /><small class="text-muted">{{getProp_url}}</small></h2>
 
    <router-link :to="{name: 'createproject', params: { domainId: getProp_domainId, url: getProp_url } }" v-if="!showLoading" class="float-right m-3">
        <b-btn><i class="fa fa-plus mr-3"></i>New project</b-btn>
    </router-link>  

    <b-table :fields="dataFields" :items="projects" v-if="!showLoading" 
             empty-text="There are no projects yet - please add a new one!" show-empty 
             responsive outlined hover> 
      <!-- A custom formatted column -->
      <template slot="name" slot-scope="data">
        <h4 class="dont-break-out mb-2 d-inline">{{data.item.name}}</h4>
        <h6 class="bg-warning ml-2 px-2 d-inline fm__unselectable text-nowrap" v-if="data.item.isPaused">paused</h6>     
        <h6 class="bg-success ml-2 px-2 d-inline fm__unselectable text-nowrap" v-else>active</h6>
        
        <div class="float-right">             
            <router-link :to="{name: 'editproject', params: { domainId: getProp_domainId, projectId: data.item.id, name: data.item.name } }">
              <b-btn class="float-right mb-1 ml-3"><i class="fa fa-pencil mr-3"></i>Edit</b-btn>
            </router-link>           
            <b-btn class="float-right mb-1 ml-3" @click="askDelete(data.item.id, data.item.name)"><i class="fa fa-trash-o mr-3"></i>Delete</b-btn>
        </div>
        <div class="mt-1 ml-2">
          <router-link :to="{name: 'howtointegrateproject', params: { name: data.item.name, code: data.item.code, callerComponentName: 'projects' } }">How to integrate?</router-link>
        </div>       
        <div class="h5 ml-2 mt-2">
          <router-link class="text-info" :to="{name: 'tickets', params: { domainId: getProp_domainId, projectId: data.item.id, name: data.item.name, callerComponentName: 'projects' } }">Show tickets</router-link>
          <h6 class="text-danger px-2 d-inline fm__unselectable text-nowrap" v-if="countOpen(data.item.tickets) > 0">
            {{countOpen(data.item.tickets)}} new ticket{{(countOpen(data.item.tickets) > 1) ? "s" : ""}}!
          </h6>
        </div>
        <div class="h5 ml-2 mt-2">
          <router-link class="text-info" :to="{name: 'alternativeselections', params: { domainId: getProp_domainId, projectId: data.item.id, name: data.item.name, callerComponentName: 'projects' } }">Show alternative selections</router-link>       
          <h6 class="text-danger px-2 d-inline fm__unselectable text-nowrap" v-if="countOpen(data.item.alternativesSelections) > 0">
            {{countOpen(data.item.alternativesSelections)}} new selection{{(countOpen(data.item.alternativesSelections) > 1) ? "s" : ""}}!
          </h6>
        </div>      
      </template>      
    </b-table>

  </div>  
</template>

<script>
import Helper from "@/helper";

export default {
  name: "Projects",
  props: ["domainId", "url"],
  computed: {
    getProp_domainId: function() {
      return this.helper.storage.getProp("domainId");
    },
    getProp_url: function() {
      return this.helper.storage.getProp("url");
    }
  },
  beforeMount: function() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .get("domains/" + this.getProp_domainId + "/projects")
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              this.projects = response.data;
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
    askDelete(id, name) {
      this.currentDeleteId = id;
      this.currentTitle = name;
      this.$refs.askDeleteRef.show();
    },
    doDelete() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .delete(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.currentDeleteId
        )
        .then(response => {
          this.showLoading = false;
          this.currentDeleteId = undefined;
          switch (response.status) {
            case 200:
              // deleted
              this.loadData();
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
    },
    countOpen(items) {
      var res = 0;
      for (let index = 0; index < items.length; index++) {
        if (!items[index].viewedAt) {
          res += 1;
        }
      }
      return res;
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
      dataFields: [{ key: "name", label: "Project name", sortable: true }],
      projects: [],
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
