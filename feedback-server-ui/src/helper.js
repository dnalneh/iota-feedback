'use strict';

export default function (app) {
    var app = app;
    const LOGOUT_TIMEOUT = 3000;

    function showModalMessage(data, okfunction) {
        app.modalHeader = data.header;
        app.modalSubHeader = data.subheader;
        app.modalText = data.text;
        if (okfunction) {
            app.modalOKFunction = okfunction;
        }
        else {
            app.modalOKFunction = function () { };
        }
        app.showModal = true;
    }

    function logOut() {
        if (window.location.host === 'localhost:8080') {
            alert("would log out now if in production mode");
        }
        else {
            setTimeout(() => app.$auth.logout(), LOGOUT_TIMEOUT);
        }
    }

    function handleUnexpectedReturnCode(response) {
        this.showModalMessage(response.data);
        console.error(response);
        logOut();
    }

    function handleNetworkError(error) {
        this.showModalMessage({
            header: "Connection error",
            subheader: "",
            text: "Please try again later."
        });
        console.error(error);
        logOut();
    }

    function handleInputError() {
        this.showModalMessage({
            header: "Input error",
            subheader: "",
            text: "Please correct the shown input errors before submitting."
        });
    }

    function goTo(component, noHistory) {
        if (noHistory) {
            app.$router.replace({ name: component });
        } else {
            app.$router.push({ name: component });
        }
    }

    // stores the prop on first try, gets it from storage on next try, for example hitting F5
    function getProp(propName) {
        if (app.$props[propName]) {
            return storeProp(propName);
        } else {
            return getStoredProp(propName);
        }
    }

    function storeProp(propName) {
        let propValue = app.$props[propName];
        sessionStorage.setItem("storage_" + app.$options.name + "_" + propName, propValue);
        return propValue;
    }

    function getStoredProp(propName) {
        let propValue = sessionStorage.getItem("storage_" + app.$options.name + "_" + propName);
        if (!propValue) {
            console.error("Error! Property missing, but should exist: " + "storage_" + app.$options.name + "_" + propName);
            goTo("domains");
        }
        else {
            return propValue;
        }
    }

    function formatISODateToLocal(date) {
        return new Date(date).toLocaleString().slice(0, -3);
    }

    function getIOTAProvider(date) {
        return "https://balancer.iotatoken.nl:4433";
    }

    function insertHighlighter() {
        let syntaxHighlightScript = document.createElement("script");
        syntaxHighlightScript.async = true;
        syntaxHighlightScript.setAttribute(
            "src",
            "https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"
        );
        document.head.appendChild(syntaxHighlightScript);
    }

    return {
        storage: {
            getProp: getProp
        },
        common: {
            handleInputError: handleInputError,
            handleUnexpectedReturnCode: handleUnexpectedReturnCode,
            handleNetworkError: handleNetworkError,
            showModalMessage: showModalMessage,
            goTo: goTo,
            formatISODateToLocal: formatISODateToLocal,
            insertHighlighter: insertHighlighter
        },
        iota: {
            getIOTAProvider: getIOTAProvider,
        }
    }
};

