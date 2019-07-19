<template>
  <div>
    <b-modal v-model="showModal" size="sm" no-close-on-backdrop ok-only centered :title="modalHeader">
      <p class="my-4 text-center">{{ modalSubHeader }}</p>
      <p class="my-4 text-center">{{ modalText }}</p>
    </b-modal >
    <div v-if="showLoading" class="spinner">
      <img src="@/assets/loading.svg" alt="loading..."/>
    </div>

    <h2>How to integrate your project<br /><small class="text-muted">{{getProp_name}}</small></h2>
    <br />
    
    <b-row class="mb-4 text-center">
      <b-col>
         <b-button @click="choosenMode = 'UsePredefined'" class="m-1">Show HTML for usage with <br/>a predefined 'div'</b-button>
      </b-col>
      <b-col>
        <b-button @click="choosenMode = 'UseExistingHTMLElement'" class="m-1">Show HTML for usage with <br/>an existing HTML-Element</b-button>
      </b-col>
      <b-col>
        <b-button @click="choosenMode = 'UseQueryParam'" class="m-1">Show HTML for usage with <br/>a special query parameter</b-button>
      </b-col>
    </b-row>    
    <div v-if="choosenMode != undefined">
      <div>
        Please insert the following <span class="font-weight-bold">script</span> into the source code of all relevant pages.
        <br />
        You can copy it from below: <br />
      </div>
      <pre v-show="choosenMode == 'UsePredefined'">
        <code v-text="insertHTMLForUsePredefined()" class="prettyprint"></code>
      </pre>
      <pre v-show="choosenMode == 'UseExistingHTMLElement'">
        <code v-text="insertHTMLForUseExistingHTMLElement()" class="prettyprint"></code>
       </pre>
      <pre v-show="choosenMode == 'UseQueryParam'">
        <code v-text="insertHTMLForUseQueryParam()" class="prettyprint"></code>
      </pre>

      <span class="font-weight-bold">Please consider:</span> <br/>
        You can adjust the part <i class="text-info px-1">locationOfCSSFile: "https://collabwebdesign.henrik-hertel.de/fm__styles.css"</i> to point to your own CSS-file with your altered style. 
       
        <br />
        If you want to allow payment via IOTA-Token you have to save your seed in your <router-link :to="{name: 'account'}">account</router-link> options, else change <i class="text-info px-1">allowPayment</i> to <i class="text-info px-1">false</i>.
      <br />
      <span v-if="choosenMode == 'UseExistingHTMLElement'">Also, replace <i class="text-info px-1">myExistingDiv</i> with the id of your element, with which you want to open the feedback-center.</span>
      <span v-if="choosenMode == 'UseQueryParam'"><br />Then, you can initially show the feedback-center when you append the query parameter <i class="text-info px-1">fm__insertfeedbackcenter=true</i> at the specific page, for example: <br/> 
      <i class="text-info px-1">www.your-domain.de/page.html?fm__insertfeedbackcenter=true</i> or <br />
      <i class="text-info px-1">www.your-domain.de/page/?fm__insertfeedbackcenter=true</i> or <br />
      <i class="text-info px-1">www.your-domain.de/page.html?anotherparam=1234&fm__insertfeedbackcenter=true</i>
      </span>
      <br />
    </div>
       
    <br/>
    <div class="float-right">     
      <b-button @click="helper.common.goTo(getProp_callerComponentName)" type="submit">OK</b-button>     
    </div>   
  </div>  
</template>

<script>
import Helper from "@/helper";

export default {
  name: "HowToIntegrateProject",
  props: ["name", "code", "callerComponentName"],
  computed: {
    getProp_name: function() {
      return this.helper.storage.getProp("name");
    },
    getProp_code: function() {
      return this.helper.storage.getProp("code");
    },
    getProp_callerComponentName: function() {
      return this.helper.storage.getProp("callerComponentName");
    }
  },
  beforeMount: function() {},
  mounted: function() {
    this.helper.common.insertHighlighter();
  },
  methods: {
    insertHTMLForUsePredefined() {
      return (
        `
  <script src="https://collabwebdesign.henrik-hertel.de/feedback_client_module.js"><\/script>
  <script> 
    Feedback_Client_Module.activate(
      { 
        projectCode: "` +
        this.getProp_code +
        `", 
        modus: "UsePredefined", 
        locationOfCSSFile: "https://collabwebdesign.henrik-hertel.de/fm__styles.css",
        allowPayment: true
      });
  <\/script>`
      );
    },
    insertHTMLForUseExistingHTMLElement() {
      return (
        `
  <script src="https://collabwebdesign.henrik-hertel.de/feedback_client_module.js"><\/script>
  <script> 
    Feedback_Client_Module.activate(
      { 
        projectCode: "` +
        this.getProp_code +
        `", 
        modus: "UseExistingHTMLElement",
        targetElement: document.getElementById("myExistingDiv"),
        locationOfCSSFile: "https://collabwebdesign.henrik-hertel.de/fm__styles.css",
        allowPayment: true
      });
  <\/script>`
      );
    },
    insertHTMLForUseQueryParam() {
      return (
        `
  <script src="https://collabwebdesign.henrik-hertel.de/feedback_client_module.js"><\/script>
  <script> 
    Feedback_Client_Module.activate(
      { 
        projectCode: "` +
        this.getProp_code +
        `", 
        modus: "UseQueryParam", 
        locationOfCSSFile: "https://collabwebdesign.henrik-hertel.de/fm__styles.css",
        allowPayment: true
      });
  <\/script>`
      );
    }
  },
  watch: {
    // whenever choosenMode changes, this function will run
    choosenMode: function(newMode, oldMode) {
      setTimeout(() => PR.prettyPrint(), 250);
    }
  },
  data: function() {
    return {
      modalHeader: "",
      modalSubHeader: "",
      modalText: "",
      showModal: false,
      showLoading: false,
      choosenMode: undefined,
      helper: new Helper(this)
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
