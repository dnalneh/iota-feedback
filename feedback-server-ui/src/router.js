import Vue from 'vue'
import Router from 'vue-router'
import Callback from '@/views/Callback.vue'
import Account from '@/components/account/Account.vue'
import Welcome from '@/components/Welcome.vue'
import Domains from '@/components/domain/Domains.vue'
import CreateDomain from '@/components/domain/CreateDomain.vue'

import Projects from '@/components/project/Projects.vue'
import CreateProject from '@/components/project/CreateProject.vue'
import EditProject from '@/components/project/EditProject.vue'
import HowToIntegrateProject from '@/components/project/HowToIntegrateProject.vue'

import Tickets from '@/components/ticket/Tickets.vue'
import ViewTicket from '@/components/ticket/ViewTicket.vue'
import PayOutTicket from '@/components/ticket/PayOutTicket.vue'

import AlternativeSelections from '@/components/alternativeselection/AlternativeSelections.vue'
import ViewSelection from '@/components/alternativeselection/ViewSelection.vue'
import PayOutSelection from '@/components/alternativeselection/PayOutSelection.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  // if the name of a route is changed, you have to look for every occurrence
  routes: [
    {
      path: '/',
      name: 'home',
      component: Welcome
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/domains',
      name: 'domains',
      component: Domains
    },
    {
      path: '/domains/create',
      name: 'createdomain',
      component: CreateDomain,
      props: true
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects,
      props: true
    },
    {
      path: '/projects/edit',
      name: 'editproject',
      component: EditProject,
      props: true
    },
    {
      path: '/projects/create',
      name: 'createproject',
      component: CreateProject,
      props: true
    },
    {
      path: '/projects/howtointegrate',
      name: 'howtointegrateproject',
      component: HowToIntegrateProject,
      props: true
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: Tickets,
      props: true
    },
    {
      path: '/tickets/viewticket',
      name: 'viewticket',
      component: ViewTicket,
      props: true
    },
    {
      path: '/tickets/payoutticket',
      name: 'payoutticket',
      component: PayOutTicket,
      props: true
    },
    {
      path: '/alternativeselections',
      name: 'alternativeselections',
      component: AlternativeSelections,
      props: true
    },
    {
      path: '/alternativeselections/viewselection',
      name: 'viewselection',
      component: ViewSelection,
      props: true
    },
    {
      path: '/alternativeselections/payoutselection',
      name: 'payoutselection',
      component: PayOutSelection,
      props: true
    }
  ]
})

// very basic "setup" of a global guard
router.beforeEach((to, from, next) => {
  if (to.name == 'callback') { // check if "to"-route is "callback" and allow access
    next()
  } else if (router.app.$auth.isAuthenticated()) { // if authenticated allow access
    next()
  } else { // trigger auth0 login
    router.app.$auth.login()
  }
})

export default router