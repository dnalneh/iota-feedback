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
      <p class="my-4">Do you really want to delete the annotation?</p>      
    </b-modal>

    <h2 class="float-left mb-3">Ticket</h2>

    <b-btn @click="deleteTicket" class="float-right m-3" v-show="showContent"><i class="fa fa-trash mr-3"></i>Delete</b-btn>
 
    
    <b-card class="myclear mb-3" v-if="showContent">
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right"><b>Status:</b></b-col>
        <b-col>
          <h6 class="bg-success px-2 d-inline fm__unselectable text-nowrap" v-if="ticket.closed">closed</h6>     
          <h6 class="bg-warning px-2 d-inline fm__unselectable text-nowrap" v-else>open</h6>
          <b-btn @click="closeTicket" size="sm" v-if="!ticket.closed" class="float-right">Close ticket</b-btn>
        </b-col>
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Sent:</b></b-col>
        <b-col>{{ helper.common.formatISODateToLocal(ticket.sent) }}</b-col>       
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>ViewGuid:</b></b-col>
        <b-col>{{ ticket.viewGuid }}</b-col>       
      </b-row>
      <b-row class="mt-4 mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Name:</b></b-col>
        <b-col>{{ ticket.name ? ticket.name : "-" }}</b-col>       
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Email:</b></b-col>
        <b-col>{{ ticket.email ? ticket.email : "-" }}</b-col>       
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Url:</b></b-col>
        <b-col>
          <a :href="ticket.url">{{ticket.url}}</a>
          <b-btn @click="showTicket" size="sm" class="float-right">Show ticket at url</b-btn>
        </b-col>     
      </b-row>
       <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Public:</b></b-col>
        <b-col>
          <i v-if="ticket.isPublic" class="fa fa-check"></i>
          <i v-else class="fa fa-remove"></i>
        </b-col>       
      </b-row>   


      <b-row v-if="ticket.iotaAddress" class="mt-4 mb-2">        
        <b-col sm="3" class="text-sm-right"><b>IOTA address:</b></b-col>
        <b-col class="dont-break-out"><a :href="getLinkToAddress()" target="_blank">{{ticket.iotaAddress}}</a></b-col>
      </b-row>
      <b-row v-if="ticket.iotaAddress" class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Payment status:</b></b-col>
        <b-col>          
          <span v-if="ticket.iotaTransactionHash">
            <h6 v-if="paymentConfirmed == undefined" class="text-danger px-2 d-inline fm__unselectable text-nowrap">checking confirmation status...</h6>   
            <h6 class="bg-success px-2 d-inline fm__unselectable text-nowrap" v-if="paymentConfirmed == true">confirmed</h6>     
            <h6 class="bg-warning px-2 d-inline fm__unselectable text-nowrap" v-if="paymentConfirmed == false">unconfirmed</h6>
            <b-btn @click="doReattachOrPromote" v-if="paymentConfirmed == false" class="float-right" size="sm">Reattach / Promote</b-btn>
            <b-btn @click="checkPaymentStatus" v-if="paymentConfirmed == false" class="float-right mr-2" size="sm">Check status</b-btn>
          </span>
          <h6 class="bg-danger px-2 d-inline fm__unselectable text-nowrap" v-else>unpayed</h6>
          <router-link v-if="!ticket.iotaTransactionHash" 
                       :to="{name: 'payoutticket', params: { domainId: getProp_domainId, projectId: getProp_projectId, ticketId : getProp_ticketId, iotaaddress: ticket.iotaAddress, callerComponentName: 'viewticket' } }">
            <b-btn class="float-right" size="sm">Pay out</b-btn>
          </router-link>         
        </b-col>
      </b-row>
      <b-row v-if="ticket.iotaTransactionHash" class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>IOTA transaction hash:</b></b-col>
        <b-col class="dont-break-out"><a :href="getLinkToTransaction()" target="_blank">{{ticket.iotaTransactionHash}}</a></b-col>
      </b-row>    

      <b-row class="mt-4 mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Browser:</b></b-col>
        <b-col class="dont-break-out">{{ parser && parser.getBrowser().name }} {{parser && parser.getBrowser().version.split('.')[0]}}</b-col>
      </b-row>     
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Browser window:</b></b-col>
        <b-col class="dont-break-out">{{ ticket.screenWidth }} x {{ ticket.screenHeight }}</b-col>
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Browser font size:</b></b-col>
        <b-col class="dont-break-out">{{ ticket.browserFontSize }}</b-col>
      </b-row>     
    </b-card>
   
    <h5 class="mb-2 ml-2" v-if="showContent">Annotations</h5>
    
    <b-table :fields="dataFields" :items="ticket.annotations" v-if="showContent"
             empty-text="There are no annotations to show!" show-empty         
             responsive outlined hover> 
      <!-- A custom formatted column -->
      <template slot="comment" slot-scope="data">
        {{data.item.comment}}       
      </template>  
      <template slot="ratings" slot-scope="data">
        <div class="fm__evaluation" v-if="data.item.ratings.length > 0">
          <input disabled type="radio" :name="data.item.id" :checked="getAVG(data.item.ratings) == 1"><i></i>
          <input disabled type="radio" :name="data.item.id" :checked="getAVG(data.item.ratings) == 2"><i></i>
          <input disabled type="radio" :name="data.item.id" :checked="getAVG(data.item.ratings) == 3"><i></i>
          <input disabled type="radio" :name="data.item.id" :checked="getAVG(data.item.ratings) == 4"><i></i>
          <input disabled type="radio" :name="data.item.id" :checked="getAVG(data.item.ratings) == 5"><i></i>          
        </div>
        <div v-else>Not rated yet</div>
        <small v-if="data.item.ratings.length > 0">({{data.item.ratings.length}} evaluation{{data.item.ratings.length != 1 ? "s": ""}})</small>
      </template>
      
      <template slot="no" slot-scope="data">
       <b-btn class="float-right mb-1 ml-3" @click="askDelete(data.item.id, '')"><i class="fa fa-trash-o mr-3"></i>Delete</b-btn>
      </template>
    </b-table>

    <h5 class="mb-2 ml-2 mt-4 float-left" v-if="showContent">Shared with</h5>
    <b-btn @click="showShareArea = true" v-show="!showShareArea && showContent" class="float-right m-3"><i class="fa fa-share mr-3"></i>Share</b-btn>

    <b-table :fields="dataFieldsSharing" :items="this.ticket.sharings" v-if="showContent"
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
      <b-btn @click="sendTicketLinkAndSave()" 
             :disabled="errors.any() && disableSendSharingButton"
             class="float-right m-3"><i class="fa fa-send mr-3"></i>Send link</b-btn>
    </b-card>

  </div>  
</template>

<script>
import Helper from "@/helper";
import UAParser from "ua-parser-js";
import IOTA from "iota.lib.js";

export default {
  name: "ViewTicket",
  props: ["domainId", "projectId", "ticketId", "sent", "callerComponentName"],
  computed: {
    getProp_domainId: function() {
      return this.helper.storage.getProp("domainId");
    },
    getProp_projectId: function() {
      return this.helper.storage.getProp("projectId");
    },
    getProp_ticketId: function() {
      return this.helper.storage.getProp("ticketId");
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
            "/tickets/" +
            this.getProp_ticketId
        )
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              this.ticket = response.data;
              if (!this.ticket.isPublic) {
                this.dataFields.splice(1, 1);
              }

              this.parser = new UAParser(this.ticket.navigatorString);
              this.showContent = true;
              if (this.ticket.iotaTransactionHash) {
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
        [this.ticket.iotaTransactionHash],
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
      let transaction = this.ticket.iotaTransactionHash;
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
            "/tickets/" +
            this.getProp_ticketId +
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
              this.ticket.iotaTransactionHash = hash;
              this.helper.common.showModalMessage({
                header: "Reattachment successful",
                subheader: "The transaction hash was updated for this ticket.",
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
            this.getProp_ticketId +
            "/annotations/" +
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
    closeTicket() {
      this.showLoading = true;
      this.$http
        .put(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.getProp_projectId +
            "/tickets/" +
            this.getProp_ticketId +
            "/close",
          { closed: "true" }
        )
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 204:
              // updated
              this.ticket.closed = true;
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
    deleteTicket() {
      this.showLoading = true;
      this.showContent = false;
      this.$http
        .delete(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.getProp_projectId +
            "/tickets/" +
            this.getProp_ticketId
        )
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              // deleted
              this.helper.common.goTo("tickets");
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
    showTicket() {
      window.open(
        this.calculateURL(),
        "_blank",
        "toolbar=yes,menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,width=" +
          this.ticket.screenWidth +
          ",height=" +
          this.ticket.screenHeight
      );
    },
    calculateURL() {
      var newUrl;
      if (this.ticket.url.indexOf("?") == -1) {
        // no params
        newUrl =
          this.ticket.url + "?fm__ticket_viewguid=" + this.ticket.viewGuid;
      } else {
        // params exists
        newUrl =
          this.ticket.url + "&fm__ticket_viewguid=" + this.ticket.viewGuid;
      }
      return newUrl;
    },
    getLinkToAddress() {
      return "https://thetangle.org/address/" + this.ticket.iotaAddress;
    },
    getLinkToTransaction() {
      return (
        "https://thetangle.org/transaction/" + this.ticket.iotaTransactionHash
      );
    },
    getAVG(ratings) {
      let avg = 0.0;
      for (let index = 0; index < ratings.length; index++) {
        avg += ratings[index].rateValue;
      }
      if (ratings.length > 0) {
        return Math.round(avg / ratings.length);
      } else {
        return 0;
      }
    },
    sendTicketLinkAndSave() {
      this.showLoading = true;
      this.disableSendSharingButton = true;
      let newSharing = { email: this.newEmail, sent: new Date().toISOString() };
      this.$http
        .post(
          "domains/" +
            this.getProp_domainId +
            "/projects/" +
            this.getProp_projectId +
            "/tickets/" +
            this.getProp_ticketId +
            "/addsharing",
          newSharing
        )
        .then(response => {
          this.showLoading = false;
          this.disableSendSharingButton = false;
          switch (response.status) {
            case 200:
              this.showShareArea = false;
              this.ticket.sharings.push(newSharing);
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
        { key: "comment", label: "Text" },
        {
          key: "ratings",
          label: "Rating",
          thStyle: { width: "120px !important" }
        },
        {
          key: "no",
          label: "",
          thStyle: { width: "100px !important" }
        }
      ],
      dataFieldsSharing: [{ key: "email" }, { key: "sent" }],
      ticket: {},
      iota: undefined,
      paymentConfirmed: undefined,
      showShareArea: false,
      disableSendSharingButton: false,
      newEmail: "",
      currentTitle: "",
      currentDeleteId: undefined,
      parser: undefined,
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.fm__evaluation {
  font-size: 0;
  white-space: nowrap;
  float: right;
  width: 100px;
  height: 20px;
  overflow: hidden;
  position: relative;
  background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIwIDIwIiB4bWw6c3BhY2U9InByZXNlcnZlIj48cG9seWdvbiBmaWxsPSIjY2NjY2NjIiBwb2ludHM9IjEwLDAgMTMuMDksNi41ODMgMjAsNy42MzkgMTUsMTIuNzY0IDE2LjE4LDIwIDEwLDE2LjU4MyAzLjgyLDIwIDUsMTIuNzY0IDAsNy42MzkgNi45MSw2LjU4MyAiLz48L3N2Zz4=");
  background-size: contain;
  i {
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 20%;
    z-index: 1;
    background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIwIDIwIiB4bWw6c3BhY2U9InByZXNlcnZlIj48cG9seWdvbiBmaWxsPSIjODg4ODg4IiBwb2ludHM9IjEwLDAgMTMuMDksNi41ODMgMjAsNy42MzkgMTUsMTIuNzY0IDE2LjE4LDIwIDEwLDE2LjU4MyAzLjgyLDIwIDUsMTIuNzY0IDAsNy42MzkgNi45MSw2LjU4MyAiLz48L3N2Zz4=");
    background-size: contain;
  }

  input {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    display: inline-block;
    width: 20%;
    height: 100%;
    margin: 0;
    padding: 0;
    z-index: 2;
    position: relative;

    &:checked + i {
      opacity: 1;
    }
  }

  i ~ i {
    width: 40%;
  }
  i ~ i ~ i {
    width: 60%;
  }
  i ~ i ~ i ~ i {
    width: 80%;
  }
  i ~ i ~ i ~ i ~ i {
    width: 100%;
  }
}
</style>
