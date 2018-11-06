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
      <p class="my-4">Do you really want to delete the following ticket and it's data?</p>     
      <p class="my-4 font-weight-bold text-center">{{currentTitle}}</p>
    </b-modal>

    <h2 class="float-left mb-5">Manage tickets of project<br /><small class="text-muted">{{getProp_name}}</small></h2>
      

    <b-table :fields="dataFields" :items="tickets" v-if="!showLoading"   
             empty-text="There are no tickets to show yet!" show-empty          
             responsive outlined hover> 
      <!-- A custom formatted column -->
      <template slot="viewedAt" slot-scope="data">        
        <h6 class="text-danger ml-2 fm__unselectable text-nowrap" v-if="!data.item.viewedAt">new</h6> 
        <i v-else class="fa fa-check ml-3"></i>
      </template>
      <template slot="closed" slot-scope="data">     
        <h6 class="bg-success px-2 d-inline fm__unselectable text-nowrap" v-if="data.item.closed">closed</h6>     
        <h6 class="bg-warning px-2 d-inline fm__unselectable text-nowrap" v-else>open</h6>        
      </template>

      <template slot="sent" slot-scope="data">
        <h4 class="dont-break-out mb-2 d-inline">{{helper.common.formatISODateToLocal(data.item.sent)}}
        </h4>
        
        <div class="float-right">             
            <router-link :to="{name: 'viewticket', params: { domainId: getProp_domainId, projectId: getProp_projectId, ticketId : data.item.id, sent: data.item.sent, callerComponentName: 'tickets' } }">
              <b-btn class="float-right mb-1 ml-3"><i class="fa fa-pencil mr-3"></i>View</b-btn>
            </router-link>           
            <b-btn class="float-right mb-1 ml-3" @click="askDelete(data.item.id, helper.common.formatISODateToLocal(data.item.sent))"><i class="fa fa-trash-o mr-3"></i>Delete</b-btn>
        </div>

        <div class="mt-1 ml-2 text-muted" v-if="data.item.name || data.item.email">
          <span v-if="data.item.name">{{data.item.name}}</span><span v-if="data.item.email"> - {{data.item.email}}</span>
        </div>
        <div class="mt-1 ml-2 text-muted" v-else>
          anonymous
        </div>
        <div class="mt-1 ml-2">
          {{data.item.annotations.length}} Annotation{{(data.item.annotations.length>1) ? "s" : ""}} 
        </div>
               
      </template>   
      
    </b-table>

  </div>  
</template>

<script>
import Helper from "@/helper";

export default {
  name: "Tickets",
  props: ["domainId", "projectId", "name", "callerComponentName"],
  computed: {
    getProp_domainId: function() {
      return this.helper.storage.getProp("domainId");
    },
    getProp_projectId: function() {
      return this.helper.storage.getProp("projectId");
    },
    getProp_name: function() {
      return this.helper.storage.getProp("name");
    },
    getProp_callerComponentName: function() {
      return this.helper.storage.getProp("callerComponentName");
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
        .get(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.getProp_projectId +
            "/tickets"
        )
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              this.tickets = response.data;
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
            this.getProp_projectId +
            "/tickets/" +
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
      dataFields: [
        {
          key: "viewedAt",
          label: "Viewed",
          sortable: true,
          thStyle: { width: "100px !important" }
        },
        {
          key: "closed",
          label: "Status",
          sortable: true,
          thStyle: { width: "100px !important" }
        },
        { key: "sent", label: "Ticket sent", sortable: true }
      ],
      tickets: [],
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
