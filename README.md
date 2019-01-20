# IOTA Feedback

## Info
IOTA Feedback is a complete business idea and a proof-of-concept. The whole concept was developed as part of a master thesis (german language). The main idea is to realize explizit rewarding of website-end-users with the help of cryptocurrencies.

## Purpose
This project allows website owners (=customers) to register their domains in order to include a client-side module to collect feedback from end-users for their websites. Users who provide helpful feedback can get IOTA tokens for it. The client-side management platform provides means for managing the feedback and for paying out IOTA.


This monorepo consists of 4 projects:
- **feedback-client-module:** This project contains the client-side module for the end user (Visual Studio Code, TypeScript, SCSS)
- **feedback-server:** This project contains the backend (ASP.NET Core Web API, C#, LocalDB in development)
- **feedback-server-ui:** This project contains the client-side management platform in the form of a single page application (Visual Studio Code, Vue.js)
- **feedback-testing-app:** This project contains an example website for local testing of the other three parts (Visual Studio Code, Node.js, Express)

# Prerequisites & Development
1. **Miscellaneous:**

    For active development you need a (free) auth0 account: Go to their website, register and create new Single Page Application (delivers the params domain and clientID for auth.js, see next section). Be sure to add "localhost:8080/callback" to "Allowed Callback URLs". Then, create a new API, whose URL will be the audience parameter in auth.js (see the next section)

2. **feedback-server:**

    2.1. Create a copy of the file "appsettings.Development.example.json" and rename that copy to "appsettings.Development.json"

    2.2. Setting up the DB

    - Visual Studio and LOCALDB (explore it via: Server Object explorer -> SQL-Server -> (localdb)...):       
        - open "Feedback-Server.sln" 
        - open the Package-Manager-Console -> Run "Update-Database" to generate the database "feedbackserver" with its tables (BTW: if you get an error like "The term 'Update-Database' is not recognized as the name of a cmdlet..." take a look at https://stackoverflow.com/questions/9674983/the-term-update-database-is-not-recognized-as-the-name-of-a-cmdlet)
        
    - Visual Studio Code: 
        - Generate a new MSSQL database (eg. on Azure) and adjust the "DBConnectionString" in your newly created "appsettings.Development.json" to point to the database
        - go to subfolder "Feedback-Server" and run "dotnet ef database update" in that folder    

    2.3. For authentication and authorization you'll need some settings of your auth0 account, please adjust the following part in your newly created appsettings.Development.json:

    ```
    "Auth0": {
        "Domain": "???",  <-- your auth0 domain
        "ApiIdentifier": "???"   <-- your auth0 api-identifier
    }
    ```

    2.4. In order to send emails, you could use mailgun and insert your domain and api key in all occurrences of:
    ```
    Email.DefaultSender = new MailgunSender("", // Mailgun Domain
                                            "" // Mailgun API Key
    ```

    2.5. Hit F5 -> check health via "localhost:3010/api/v1/healthcheck" and let the Web-API up and running

2. **feedback-server-ui:**
    - Create a copy of the file "config.example.js" and rename that copy to "config.js"
    - open "config.js" and insert your settings from your auth0 account above:

        ```
        const web_api_base_url = "http://localhost:3010";

        export default {
            WEB_API_URL: web_api_base_url + "/api/v1.0/",
            WEB_API_HUB_URL: web_api_base_url + "/hubs/newfeedback",
            AUTH0_DOMAIN: '', // <-- your auth0 domain
            AUTH0_CLIENTID: '', // <-- your clientid of the auth0 Single Page Application
            AUTH0_REDIRECT_URI: 'http://localhost:8080/callback',
            AUTH0_AUDIENCE: '' // <-- your auth0 api-identifier
        }
        ```

    - run "npm install" once at this folder
    - run "npm run serve" for developing
    - open http://localhost:8080, you should be redirected to auth0
    - create a new account
    - log in with created account
    - create a new domain "localhost:8081"
    - click on the link "0 projects"
    - add a new project with a name of your choice
    - the page "How to integrate your project" appears, click on one of the buttons and notice the **projectCode**, leave the website open

3. **feedback-client-module:**
    - run "npm install" once at this folder
    - then run "npm run firstbuild" once, to build the initial code (feedback-testing-app needs that output to function)
    - from now on, you just have to run "npm run dev" when you want to develop

5. **feedback-testing-app:**
    - run "npm install" once at this folder
    - chrome is the default browser that has to be installed, but you can change the browser in the package.json file
    - if you adjust the .scss files, then you need to compile it to .css, for example with the Visual Studio Code extension "easy-sass"
    - **IMPORTANT:** Now open the file public -> index.html -> scroll to end and replace the projectCode with the one mentioned above
    - do the same with index_div.html and index_queryparam.html
    - **Alternative:** do not change the three html-files, instead open the database, open the Projects table and change the projectCode of the existing project to "c7cab317-4968-2ab6-202c-3040d5f71426"
    - run "npm run dev" for developing, there is a watcher that listens for changes in feedback-client-module code
    - now you should be able to create new feedback at the webpage "localhost:8081"
