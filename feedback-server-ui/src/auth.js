import auth0 from 'auth0-js'
import Vue from 'vue'

let webAuth = new auth0.WebAuth({
    domain: '???.auth0.com',
    clientID: '???',
    redirectUri: 'http://localhost:8080/callback',
    audience: '???',
    responseType: 'token id_token',
    scope: 'openid email'
})

let auth = new Vue({
    computed: {
        token: {
            get: function () {
                return localStorage.getItem('id_token')
            },
            set: function (id_token) {
                localStorage.setItem('id_token', id_token)
            }
        },
        accessToken: {
            get: function () {
                return localStorage.getItem('access_token')
            },
            set: function (accessToken) {
                localStorage.setItem('access_token', accessToken)
            }
        },
        expiresAt: {
            get: function () {
                return localStorage.getItem('expires_at')
            },
            set: function (expiresIn) {
                let expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime())
                localStorage.setItem('expires_at', expiresAt)
            }
        },
        user: { // user.sub is the distinct identifier! also, there are things like user.email and user.email_verified 
            get: function () {
                return JSON.parse(localStorage.getItem('user'))
            },
            set: function (user) {
                localStorage.setItem('user', JSON.stringify(user))
            }
        }
    },
    methods: {
        login() {
            webAuth.authorize()
        },
        logout() {
            return new Promise((resolve, reject) => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('id_token')
                localStorage.removeItem('expires_at')
                localStorage.removeItem('user')
                webAuth.authorize()
            })
        },
        isAuthenticated() {
            return new Date().getTime() < this.expiresAt
        },
        handleAuthentication() {
            return new Promise((resolve, reject) => {
                webAuth.parseHash((err, authResult) => {
                    if (authResult && authResult.accessToken && authResult.idToken) {
                        this.expiresAt = authResult.expiresIn
                        this.accessToken = authResult.accessToken
                        this.token = authResult.idToken
                        this.user = authResult.idTokenPayload

                        // 1 of 2 - On login: Set Authorization header for axios (= $http) calls automatically for every request
                        Vue.prototype.$http.defaults.headers.common["Authorization"] =
                            "Bearer " + this.accessToken;
                        resolve()

                    } else if (err) {
                        this.logout()
                        reject(err)
                    }
                })
            })
        }
    }
})

export default {
    install: function (Vue) {
        Vue.prototype.$auth = auth
    }
}