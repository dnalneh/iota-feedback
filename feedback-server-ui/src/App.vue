<template>
  <div id="app" class="container-fluid h-100">
      <b-modal v-model="showModal" size="sm" no-close-on-backdrop
              @ok="modalOKFunction"
              centered :title="modalHeader">
        <p class="my-4 text-center">{{ modalSubHeader }}</p>
        <p class="my-4 text-center">{{ modalText }}</p>
        <div slot="modal-ok">
          Show
        </div>
      </b-modal >
      <div class="aside_row row h-100">
          <aside class="col-12 col-md-auto p-1 bg-dark">
              <nav class="navbar navbar-expand navbar-dark bg-dark flex-md-column flex-row align-items-start py-2">
                  <div class="collapse navbar-collapse">
                      <ul class="flex-md-column flex-row navbar-nav w-100 justify-content-between">
                          <li class="nav-item">
                              <router-link class="nav-link pl-0 text-nowrap" to="/"><i class="fa fa-home fa-fw"></i> <span class="font-weight-bold ml-1">Home</span></router-link>
                          </li>
                           <li class="nav-item">
                            <router-link class="nav-link pl-0" to="/domains"><i class="fa fa-globe fa-fw"></i> <span class="d-none d-md-inline ml-1">Manage domains</span></router-link>
                          </li>                                               
                          <li class="nav-item">
                            <router-link class="nav-link pl-0" to="/account"><i class="fa fa-cog fa-fw"></i> <span class="d-none d-md-inline ml-1">Account</span></router-link>
                          </li>
                          <li class="nav-item">                            
                              <a class="nav-link pl-0" href="#" @click="$auth.logout()"><i class="fa fa-power-off fa-fw"></i> <span class="d-none d-md-inline ml-1">Logout</span></a>
                          </li>
                      </ul>
                  </div>
              </nav>
          </aside>
          <main id="main" class="col bg-faded py-3">             
              <!-- die der Route zugeordnete Komponente wird hier gerendert-->
              <router-view></router-view>
          </main>
      </div>
  </div>
</template>

<script>
import { HubConnectionBuilder } from "@aspnet/signalr";
import Helper from "@/helper";
import config from "@/config";

export default {
  name: "home",
  mounted() {
    const connection = new HubConnectionBuilder()
      .withUrl(config.WEB_API_HUB_URL)
      .build();

    connection.on("TicketAdded", message => {
      if (message.authIdentifier == this.$auth.user.sub) {
        new Helper(this).common.showModalMessage(
          {
            header: "New ticket",
            subheader: "",
            text:
              "A new ticket for the project '" +
              message.projectName +
              "' of the domain '" +
              message.domain +
              "' has arrived."
          },
          () => {
            if (this.$router.currentRoute.name == "viewticket") {
              // weil man nicht refreshen kann :-(
              this.$router.push({
                name: "tickets",
                params: {
                  domainId: message.domainId,
                  projectId: message.projectId,
                  name: message.projectName,
                  callerComponentName: this.$router.currentRoute.name
                }
              });
            } else {
              this.$router.push({
                name: "viewticket",
                params: {
                  domainId: message.domainId,
                  projectId: message.projectId,
                  ticketId: message.ticketId,
                  sent: message.sent,
                  callerComponentName: this.$router.currentRoute.name
                }
              });
            }
          }
        );
      }
    });
    connection.on("AlternativesSelectionAdded", message => {
      if (message.authIdentifier == this.$auth.user.sub) {
        new Helper(this).common.showModalMessage(
          {
            header: "New alternative selection",
            subheader: "",
            text:
              "A new selection for the project '" +
              message.projectName +
              "' of the domain '" +
              message.domain +
              "' has arrived."
          },
          () => {
            if (this.$router.currentRoute.name == "viewselection") {
              // weil man nicht refreshen kann :-(
              this.$router.push({
                name: "alternativeselections",
                params: {
                  domainId: message.domainId,
                  projectId: message.projectId,
                  name: message.projectName,
                  callerComponentName: this.$router.currentRoute.name
                }
              });
            } else {
              this.$router.push({
                name: "viewselection",
                params: {
                  domainId: message.domainId,
                  projectId: message.projectId,
                  selectionId: message.alternativesSelectionId,
                  sent: message.sent,
                  callerComponentName: this.$router.currentRoute.name
                }
              });
            }
          }
        );
      }
    });
    connection.start().catch(err => console.error(err.toString()));
  },
  data() {
    return {
      modalHeader: "",
      modalSubHeader: "",
      modalText: "",
      modalOKFunction: function() {},
      showModal: false
    };
  }
};
</script>

<style lang="scss">
@import url("https://maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
@import url("//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css");

.aside_row {
  min-height: 100vh;
}

.spinner {
  position: fixed;
  z-index: 999;
  height: 2em;
  width: 2em;
  overflow: show;
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.fm__unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.dont-break-out {
  /* These are technically the same, but use both */
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  word-break: break-all;
  /* Instead use this non-standard one: */
  word-break: break-word;
}

.myclear {
  clear: both;
}
</style>
