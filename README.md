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
    - For active development you need a (free) auth0 account: Go to their website, register and create new Single Page Application (delivers the params domain and clientID for auth.js, see below). Be sure to add "localhost:8080/callback" to Allowed Callback URLs. Then, create a new API, whose URL will be the audience parameter in auth.js, see below:

        feedback-server-ui -> src -> auth.js:
```
        let webAuth = new auth0.WebAuth({
            domain: '???.auth0.com',
            clientID: '???',
            redirectUri: 'localhost:8080/callback',
            audience: '???',
            responseType: 'token id_token',
            scope: 'openid email'
        })
```

2. **feedback-client-module:**
    - run "npm install" once at this folder
    - then run "npm run firstbuild" once, to build the initial code (feedback-testing-app needs that output to function)
    - from now on, you just have to run "npm run dev" when you want to develop

3. **feedback-testing-app:**
    - run "npm install" once at this folder
    - chrome is the default browser that has to be installed, but you can change the browser in the package.json file
    - if you adjust the .scss files, then you need to compile it to .css, for example with the Visual Studio Code extension "easy-sass"
    - from now on, you just have to run "npm run dev" when you want to develop

4. **feedback-server:**

    4.1. Create a copy of the file "appsettings.Development.example.json" and rename that copy to "appsettings.Development.json"

    4.2. In Visual Studio go to SQL Server Object explorer -> SQL-Server -> (localdb)... -> databases -> right click -> add database -> fill in the name "feedbackserver"

    4.3. In Visual Studio open the Package-Manager-Console -> Run "Update-Database" to generate the database with its tables

    4.4. Hit F5 -> check health via "localhost:3010/api/v1/healthcheck"

    4.5. For authentication and authorization you'll need some settings of your auth0 account, please adjust the following part in your newly created appsettings.Development.json:

    ```
    "Auth0": {
        "Domain": "???",  <-- your auth0 domain
        "ApiIdentifier": "???"   <-- your auth0 api-identifier
    }
    ```

    4.6. In order to send emails, you could use mailgun and insert your domain and api key in all occurrences of:
    ```
    Email.DefaultSender = new MailgunSender("", // Mailgun Domain
                                            "" // Mailgun API Key
    ```

5. **feedback-server-ui:**
    - run "npm install" once at this folder
    - from now on, you just have to run "npm run serve" when you want to develop

6. **Additional steps**
    - open http://localhost:8080, you should be redirected to auth0
    - create a new account
    - log in with created account
    - create a new domain "localhost:8081"
    - add a new project
    - at the following page "How to integrate your project", click on one of the buttons and copy the "projectCode"
    - open the file feedback-testing-app -> public -> index.html -> scroll to end and replace the projectCode
    - do the same with index_div.html and index_queryparam.html
    - start the feedback-testing app with "npm run dev" and open "localhost:8081" in browser
    - now you should be able to create new feedback at the webpage
