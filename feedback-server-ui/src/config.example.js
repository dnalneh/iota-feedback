const web_api_base_url = "http://localhost:3010";

export default {
    WEB_API_URL: web_api_base_url + "/api/v1.0/",
    WEB_API_HUB_URL: web_api_base_url + "/hubs/newfeedback",
    AUTH0_DOMAIN: '', // <-- your auth0 domain
    AUTH0_CLIENTID: '', // <-- your clientid of the auth0 Single Page Application
    AUTH0_REDIRECT_URI: 'http://localhost:8080/callback',
    AUTH0_AUDIENCE: '' // <-- your auth0 api-identifier
}