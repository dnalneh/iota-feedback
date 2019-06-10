import Vue from 'vue'
import Router from 'vue-router'
import Callback from '@/views/Callback.vue'
import Account from '@/views/account/Account.vue'
import Welcome from '@/views/Welcome.vue'
import Domains from '@/views/domain/Domains.vue'
import CreateDomain from '@/views/domain/CreateDomain.vue'

import Projects from '@/views/project/Projects.vue'
import CreateProject from '@/views/project/CreateProject.vue'
import EditProject from '@/views/project/EditProject.vue'
import HowToIntegrateProject from '@/views/project/HowToIntegrateProject.vue'

import Tickets from '@/views/ticket/Tickets.vue'
import ViewTicket from '@/views/ticket/ViewTicket.vue'
import PayOutTicket from '@/views/ticket/PayOutTicket.vue'

import AlternativeSelections from '@/views/alternativeselection/AlternativeSelections.vue'
import ViewSelection from '@/views/alternativeselection/ViewSelection.vue'
import PayOutSelection from '@/views/alternativeselection/PayOutSelection.vue'

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