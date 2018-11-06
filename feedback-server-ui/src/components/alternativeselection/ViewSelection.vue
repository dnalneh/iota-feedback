<template>
  <div>
   <b-modal v-model="showModal" size="sm" no-close-on-backdrop ok-only centered :title="modalHeader">
      <p class="my-4 text-center">{{ modalSubHeader }}</p>
      <p class="my-4 text-center">{{ modalText }}</p>
    </b-modal >
    <div v-if="showLoading" class="spinner">
      <img src="@/assets/loading.svg" alt="loading..."/>
    </div>

    <h2 class="float-left mb-3">Alternative Selection</h2>

    <b-btn @click="deleteSelection" class="float-right m-3" v-show="showContent"><i class="fa fa-trash mr-3"></i>Delete</b-btn>
        
    <b-card class="myclear mb-3" v-if="showContent">      
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Sent:</b></b-col>
        <b-col>{{ helper.common.formatISODateToLocal(selection.sent) }}</b-col>       
      </b-row>     
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Name:</b></b-col>
        <b-col>{{ selection.name ? selection.name : "-" }}</b-col>       
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Email:</b></b-col>
        <b-col>{{ selection.email ? selection.email : "-" }}</b-col>       
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Url:</b></b-col>
        <b-col>
          <a :href="selection.url">{{selection.url}}</a>
          <b-btn @click="showSelection" size="sm" class="float-right">Show selection at url</b-btn>
        </b-col>     
      </b-row>    


      <b-row v-if="selection.iotaAddress" class="mt-4 mb-2">        
        <b-col sm="3" class="text-sm-right"><b>IOTA address:</b></b-col>
        <b-col class="dont-break-out"><a :href="getLinkToAddress()" target="_blank">{{selection.iotaAddress}}</a></b-col>
      </b-row>
      <b-row v-if="selection.iotaAddress" class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Payment status:</b></b-col>
        <b-col>          
          <span v-if="selection.iotaTransactionHash">
            <h6 v-if="paymentConfirmed == undefined" class="text-danger px-2 d-inline fm__unselectable text-nowrap">checking confirmation status...</h6>   
            <h6 class="bg-success px-2 d-inline fm__unselectable text-nowrap" v-if="paymentConfirmed == true">confirmed</h6>     
            <h6 class="bg-warning px-2 d-inline fm__unselectable text-nowrap" v-if="paymentConfirmed == false">unconfirmed</h6>
            <b-btn @click="doReattachOrPromote" v-if="paymentConfirmed == false" class="float-right" size="sm">Reattach / Promote</b-btn>
            <b-btn @click="checkPaymentStatus" v-if="paymentConfirmed == false" class="float-right mr-2" size="sm">Check status</b-btn>
          </span>
          <h6 class="bg-danger px-2 d-inline fm__unselectable text-nowrap" v-else>unpayed</h6>         
          <router-link v-if="!selection.iotaTransactionHash" 
                       :to="{name: 'payoutselection', params: { domainId: getProp_domainId, projectId: getProp_projectId, selectionId : getProp_selectionId, iotaaddress: selection.iotaAddress, callerComponentName: 'viewselection' } }">
            <b-btn class="float-right" size="sm">Pay out</b-btn>
          </router-link>         
        </b-col>
      </b-row>
      <b-row v-if="selection.iotaTransactionHash" class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>IOTA transaction hash:</b></b-col>
        <b-col class="dont-break-out"><a :href="getLinkToTransaction()" target="_blank">{{selection.iotaTransactionHash}}</a></b-col>
      </b-row>

    </b-card>
   
    <h5 class="mb-2 ml-2" v-if="showContent">Considered areas</h5>

    <b-table :fields="dataFields" :items="selection.areaInfoItems" v-if="showContent"
             empty-text="There are no items to show!" show-empty         
             responsive outlined hover> 
      <!-- A custom formatted column -->
      <template slot="comment" slot-scope="data">
        {{data.item.comment}}       
      </template>
    </b-table>

    <h5 class="mb-2 ml-2 mt-4 float-left" v-if="showContent">Shared with</h5>
    <b-btn @click="showShareArea = true" v-show="!showShareArea && showContent" class="float-right m-3"><i class="fa fa-share mr-3"></i>Share</b-btn>

    <b-table :fields="dataFieldsSharing" :items="this.selection.sharings" v-if="showContent"
             empty-text="Not shared yet!" show-empty         
             responsive outlined hover class="myclear">
      <template slot="sent" slot-scope="data">
        {{helper.common.formatISODateToLocal(data.item.sent)}}
      </template>
    </b-table>
 
    <b-card class="myclear mb-3" border-variant="success" v-if="showContent && showShareArea">
      <label for="exampleInput1"> Please insert an email-address and then click the "send link" button:</label>
      <input id="exampleInput1"
                      name="email"
                      :class="{'is-invalid': errors.has('email'), 'form-control' : true }"
                      type="text"
                      v-model="newEmail"                     
                      v-validate="'required|email'"
                      placeholder="Enter email" />
      
      <div v-show="errors.has('email')" class="invalid-feedback m-1">{{ errors.first('email') }}</div>
      <br/>
The following link will be sent:<br />
<div class="mt-1">{{calculateURL()}}</div>
      <b-btn @click="sendSelectionLinkAndSave()" 
             :disabled="errors.any() && disableSendSharingButton"
             class="float-right m-3"><i class="fa fa-send mr-3"></i>Send link</b-btn>
    </b-card>

  </div>  
</template>

<script>
import Helper from "@/helper";
import IOTA from "iota.lib.js";

export default {
  name: "ViewSelection",
  props: [
    "domainId",
    "projectId",
    "selectionId",
    "sent",
    "callerComponentName"
  ],
  computed: {
    getProp_domainId: function() {
      return this.helper.storage.getProp("domainId");
    },
    getProp_projectId: function() {
      return this.helper.storage.getProp("projectId");
    },
    getProp_selectionId: function() {
      return this.helper.storage.getProp("selectionId");
    },
    getProp_sent: function() {
      return this.helper.storage.getProp("sent");
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
            "/alternativesselections/" +
            this.getProp_selectionId
        )
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              this.selection = response.data;
              this.showContent = true;
              if (this.selection.iotaTransactionHash) {
                this.loadUserDataAndCheckIOTAPaymentStatus();
              }
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
    loadUserDataAndCheckIOTAPaymentStatus() {
      this.$http
        .get("users")
        .then(response => {
          switch (response.status) {
            case 200:
              const iotaProvider = response.data.iotaNode
                ? response.data.iotaNode
                : this.helper.iota.getIOTAProvider();
              this.iota = new IOTA({ provider: iotaProvider });
              this.checkPaymentStatus();
              break;
            default:
              this.helper.common.handleUnexpectedReturnCode(response);
              break;
          }
        })
        .catch(error => {
          this.helper.common.handleNetworkError(error);
        });
    },
    checkPaymentStatus() {
      this.paymentConfirmed = undefined;
      this.iota.api.getLatestInclusion(
        [this.selection.iotaTransactionHash],
        (error, inclusionStates) => {
          if (error) {
            this.helper.common.showModalMessage({
              header: "Error",
              subheader: "Not able to get confirmation status of payment.",
              text: "Please load page again."
            });
            console.error("getLatestInclusion error", error);
          } else if (inclusionStates[0]) {
            this.paymentConfirmed = true;
          } else {
            this.paymentConfirmed = false;
          }
        }
      );
    },
    async doReattachOrPromote() {
      this.showLoading = true;
      let transaction = this.selection.iotaTransactionHash;
      let promotable;
      try {
        promotable = await this.iota.api.isPromotable(transaction);
      } catch (error) {
        this.showLoading = false;
        this.helper.common.showModalMessage({
          header: "Error",
          subheader: "Not able to reattach or promote transaction.",
          text: ""
        });
        return;
      }

      if (promotable) {
        let count = 0;
        const MAX_PROMOTIONS = 4;
        function interrupt() {
          return count++ >= MAX_PROMOTIONS;
        }

        const params = { interrupt, delay: 1000 };
        const spamTransfer = [
          { address: "9".repeat(81), value: 0, message: "", tag: "" }
        ];
        this.iota.api.promoteTransaction(
          transaction,
          10 /* depth must be high because of new tip selection algorithm */,
          15,
          spamTransfer,
          params,
          (error, success) => {
            this.showLoading = false;
            if (error) {
              this.helper.common.showModalMessage({
                header: "Error",
                subheader: "Not able to promote transaction.",
                text: "Please try again later."
              });
              console.error("promoteTransaction error", error);
            } else {
              this.helper.common.showModalMessage({
                header: "Promotion successful",
                subheader: "",
                text:
                  "Check the status of the payment again in a minute or two."
              });
              setTimeout(() => {
                this.checkPaymentStatus();
              }, 10 * 1000);
            }
          }
        );
      } else {
        this.iota.api.replayBundle(
          transaction,
          10 /* depth must be high because of new tip selection algorithm */,
          15,
          (error, success) => {
            this.showLoading = true;
            if (error) {
              console.error(error.message);
              this.helper.common.showModalMessage({
                header: "Error",
                subheader: "Not able to reattach transaction.",
                text: "Please try again later."
              });
            } else {
              this.savePayment(success[0].hash);
            }
          }
        );
      }
    },
    savePayment(hash) {
      this.$http
        .put(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.getProp_projectId +
            "/alternativesselections/" +
            this.getProp_selectionId +
            "/settransactionhash",
          {
            transactionHash: hash,
            forceOverwrite: true
          }
        )
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 204:
              // nice
              this.selection.iotaTransactionHash = hash;
              this.helper.common.showModalMessage({
                header: "Reattachment successful",
                subheader:
                  "The transaction hash was updated for this selection.",
                text:
                  "Check the status of the payment again in a minute or two."
              });
              setTimeout(() => {
                this.checkPaymentStatus();
              }, 10 * 1000);
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
    deleteSelection() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .delete(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.getProp_projectId +
            "/alternativesselections/" +
            this.getProp_selectionId
        )
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              // deleted
              this.helper.common.goTo("alternativeselections");
              break;
            default:
              this.showContent = true;
              this.helper.common.handleUnexpectedReturnCode(response);
              break;
          }
        })
        .catch(error => {
          this.showContent = true;
          this.helper.common.handleNetworkError(error);
        });
    },
    showSelection() {
      window.open(this.calculateURL(), "_blank");
    },
    calculateURL() {
      var newUrl;
      if (this.selection.url.indexOf("?") == -1) {
        // no params
        newUrl =
          this.selection.url +
          "?fm__selection_viewguid=" +
          this.selection.viewGuid;
      } else {
        // params exists
        newUrl =
          this.selection.url +
          "&fm__selection_viewguid=" +
          this.selection.viewGuid;
      }
      return newUrl;
    },
    getLinkToAddress() {
      return "https://thetangle.org/address/" + this.selection.iotaAddress;
    },
    getLinkToTransaction() {
      return (
        "https://thetangle.org/transaction/" +
        this.selection.iotaTransactionHash
      );
    },
    sendSelectionLinkAndSave() {
      this.showLoading = true;
      this.disableSendSharingButton = true;
      let newSharing = { email: this.newEmail, sent: new Date().toISOString() };
      this.$http
        .post(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.getProp_projectId +
            "/alternativesselections/" +
            this.getProp_selectionId +
            "/addsharing",
          newSharing
        )
        .then(response => {
          this.showLoading = false;
          this.disableSendSharingButton = false;
          switch (response.status) {
            case 200:
              this.showShareArea = false;
              this.selection.sharings.push(newSharing);
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
          this.disableSendSharingButton = false;
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
        { key: "name", label: "data-fm-area-name" },
        { key: "choosenItemTitle", label: "choosen alternative (title)" },
        { key: "comment", label: "Comment" }
      ],
      dataFieldsSharing: [{ key: "email" }, { key: "sent" }],
      selection: {},
      iota: undefined,
      paymentConfirmed: undefined,
      showShareArea: false,
      disableSendSharingButton: false,
      newEmail: "",
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
