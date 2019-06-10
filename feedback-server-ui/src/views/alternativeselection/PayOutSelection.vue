<template>
  <div>
    <b-modal v-model="showModal" size="sm" no-close-on-backdrop ok-only 
            @ok="modalOKFunction"
            centered :title="modalHeader">
      <p class="my-4 text-center">{{ modalSubHeader }}</p>
      <p class="my-4 text-center">{{ modalText }}</p>
    </b-modal >
    <div v-if="showLoading" class="spinner">
      <img src="@/assets/loading.svg" alt="loading..."/>
    </div>

    <h2 class="mb-3">Payout selection</h2>

    
    <b-card class="mb-3" v-if="showContent">
      <b-row class="mb-4">
        <b-col sm="3" class="text-sm-right"><b>IOTA price:</b></b-col>
        <b-col v-if="iotaDataLoaded">
          {{iotaData.currentPriceEur}} € / MIOTA 
        </b-col>
        <b-col v-else class="text-danger">
          loading... 
        </b-col>
      </b-row>
      <b-row class="mb-2">        
        <b-col sm="3" class="text-sm-right"><b>Your wallet:</b></b-col>
        <b-col v-if="iotaData.walletAmount != undefined">{{ iotaData.walletAmount }} MIOTA</b-col>
         <b-col v-else class="text-danger">
          loading... 
        </b-col>   
      </b-row> 
      <b-row>        
        <b-col sm="3" class="text-sm-right"><b>equals:</b></b-col>
        <b-col v-if="iotaData.walletAmountEur != undefined">{{ iotaData.walletAmountEur }} €</b-col>
         <b-col v-else class="text-danger">
          loading... 
        </b-col>    
      </b-row>       
    </b-card>
    
    <form @submit.prevent="validateBeforeSubmit" novalidate v-if="showContent">
      <div class="form-group mb-3">
        <label for="exampleInput0">Receiver address:</label>                    
        <input id="exampleInput0"              
                type="text"
                :value="getProp_iotaaddress"
                readonly          
                class="form-control" />       
      </div>
      <div class="form-group mb-3">
        <label for="exampleInput1">Payment message for user:</label>                    
        <b-textarea id="exampleInput1" 
               name="message"             
               type="text"
               v-model="paymentMessage"
               v-validate="'max:1000'"
               :class="{'is-invalid': errors.has('message'), 'form-control' : true }"                         
               class="form-control" />
        <div v-show="errors.has('message')" class="invalid-feedback m-1">{{ errors.first('message') }}</div>    
      </div>
      <b-row class="mb-4">
        <b-col>
          <div class="form-group mb-3">
            <label for="exampleInput1">Amount MIOTA:</label>                    
            <input id="exampleInput1"                 
                    name="amount MIOTA"
                    type="text"
                    v-model="amountMIota"
                    v-validate="'required|decimal'"
                    :class="{'is-invalid': errors.has('amount MIOTA'), 'form-control' : true }"                      
                    placeholder="Enter amount" />
            <div v-show="errors.has('amount MIOTA')" class="invalid-feedback m-1">{{ errors.first('amount MIOTA') }}</div>
          </div>
        </b-col>
        <b-col>
          <div class="form-group mb-3" v-if="iotaDataLoaded">
            <label for="exampleInput2">Amount €:</label>                    
            <input id="exampleInput2"
                    type="text"
                    v-model="amountEur"             
                    class="form-control"                      
                    readonly />       
          </div>
          <div v-else class="text-danger">
            loading... 
          </div>
        </b-col>                  
      </b-row>       

      <b-card v-if="paymentstatus != ''" class="mt-3 mb-3">
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Payment status:</b></b-col>
          <b-col>
            {{paymentstatus}} 
          </b-col>
        </b-row>
      </b-card>

      <div class="float-right">    
        <b-button @click="helper.common.goTo(getProp_callerComponentName)" type="button" :disabled="buttonIsDisabled" variant="warning" class="mr-3">Cancel</b-button>
        <b-button type="submit" :disabled="errors.any() || buttonIsDisabled">Pay out</b-button>     
      </div>
    </form>  

  </div>  
</template>

<script>
import Helper from "@/helper";
import IOTA from "iota.lib.js";
import axios from "axios";

export default {
  name: "PayOutSelection",
  props: [
    "domainId",
    "projectId",
    "selectionId",
    "iotaaddress",
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
    getProp_iotaaddress: function() {
      return this.helper.storage.getProp("iotaaddress");
    },
    getProp_callerComponentName: function() {
      return this.helper.storage.getProp("callerComponentName");
    },
    amountMIota: {
      // getter
      get: function() {
        return this.amount;
      },
      // setter
      set: function(newValue) {
        this.amount = newValue;
        this.amountEur = this.round(
          newValue * this.iotaData.currentPriceEur,
          2
        );
      }
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
          switch (response.status) {
            case 200:
              if (response.data.iotaTransactionHash) {
                this.showLoading = false;
                this.helper.common.showModalMessage(
                  {
                    header: "Error",
                    subheader: "",
                    text: "The payment for this selection is already done."
                  },
                  () => {
                    this.helper.common.goTo("viewselection", true);
                  }
                );
              } else {
                this.loadUserData();
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
    loadUserData() {
      this.$http
        .get("users")
        .then(response => {
          this.showLoading = false;
          switch (response.status) {
            case 200:
              if (response.data.iotaSeed) {
                this.user = response.data;
                this.showContent = true;
                this.getIotaData();
              } else {
                this.helper.common.showModalMessage(
                  {
                    header: "Missing IOTA seed",
                    subheader: "",
                    text: "Please enter a seed in your account first."
                  },
                  () => {
                    this.helper.common.goTo("account");
                  }
                );
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
    validateBeforeSubmit() {
      this.$validator
        .validateAll()
        .then(result => {
          if (result) {
            this.doPayOut();
          } else {
            this.helper.common.handleInputError();
          }
        })
        .catch(() => {
          this.helper.common.handleInputError();
        });
    },
    getIotaData() {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://min-api.cryptocompare.com/data/price?fsym=IOTA&tsyms=EUR",
        true
      );
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = () => {
        switch (xhr.status) {
          case 200:
            const response = JSON.parse(xhr.responseText);
            this.iotaData.currentPriceEur = this.round(
              parseFloat(response.EUR),
              4
            );

            const iotaProvider = this.user.iotaNode
              ? this.user.iotaNode
              : this.helper.iota.getIOTAProvider();
            this.iota = new IOTA({ provider: iotaProvider });

            this.iota.api.getAccountData(
              this.user.iotaSeed,
              {
                start: 0,
                security: 2
              },
              (e, accountData) => {
                if (e) {
                  console.log("Can't get AccountData for seed ", e);
                } else {
                  this.iotaData.walletAmount = accountData.balance / 1000000;
                  this.iotaData.walletAmountEur =
                    this.iotaData.currentPriceEur *
                    accountData.balance /
                    1000000;
                }
              }
            );

            this.iotaDataLoaded = true;
            break;
          default:
        }
      };
      xhr.onerror = () => {};
      xhr.send();
    },
    doPayOut() {
      this.showLoading = true;
      this.buttonIsDisabled = true;

      if (this.iota.valid.isAddress(this.getProp_iotaaddress)) {
        const transfers = [
          {
            value: parseInt(this.amountMIota * 1000000),
            address: this.getProp_iotaaddress,
            message: this.iota.utils.toTrytes(this.paymentMessage)
          }
        ];
        this.paymentstatus =
          "Sending MIOTA... (Using " +
          (this.user.iotaNode
            ? this.user.iotaNode
            : " default-provider " + this.helper.iota.getIOTAProvider()) +
          ")";
        this.iota.api.sendTransfer(
          this.user.iotaSeed,
          3,
          15,
          transfers,
          (error, bundle) => {
            if (error) {
              console.log(error);
              this.showLoading = false;
              this.buttonIsDisabled = false;
              this.paymentstatus = "";
              this.helper.common.showModalMessage({
                header: "Transfer error",
                subheader: "",
                text: "Please try again later."
              });
            } else {
              this.paymentstatus = "Saving payment...";
              this.savePayment(bundle[0].hash);
            }
          }
        );
      } else {
        this.showLoading = false;
        this.buttonIsDisabled = false;
        this.paymentstatus = "";
        this.helper.common.showModalMessage({
          header: "Input error",
          subheader: "",
          text: "The IOTA address is not valid."
        });
      }
    },
    round(number, precision) {
      var shift = function(number, precision) {
        var numArray = ("" + number).split("e");
        return +(
          numArray[0] +
          "e" +
          (numArray[1] ? +numArray[1] + precision : precision)
        );
      };
      return shift(Math.round(shift(number, +precision)), -precision);
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
            forceOverwrite: false
          }
        )
        .then(response => {
          this.showLoading = false;
          this.buttonIsDisabled = false;
          this.paymentstatus = "";
          switch (response.status) {
            case 204:
              // nice
              this.helper.common.goTo(this.getProp_callerComponentName, true);
              break;
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
      modalOKFunction: function() {},
      showModal: false,
      showLoading: true,
      showContent: false,
      amount: "",
      amountEur: "",
      paymentstatus: "",
      paymentMessage: "Thanks for your feedback!",
      user: {},
      iota: undefined,
      iotaData: {
        currentPriceEur: 0,
        walletAmount: undefined,
        walletAmountEur: undefined
      },
      iotaDataLoaded: false,
      buttonIsDisabled: false,
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
