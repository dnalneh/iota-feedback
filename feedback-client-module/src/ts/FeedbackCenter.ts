import { AlternativeAreaUIElement } from "./AlternativeAreaUIElement";
import { FeedbackCenter_Modus } from "./Enums";
import { FeedbackCenterFinder } from "./helper/FeedbackCenterFinder";
import { Constants } from "./Constants";
import * as Helper from "./helper/Helper";
import {
    IAnnotation, IAnnotationRatingStorage, IAnnotationUIElement, IConfig, IFactory, IFeedbackCenter,
    IModalMessage, ITicket, ITicketStorage, IAlternativeAreaUIElement, IAreaInfoItem, IAlternativesSelection
} from "./Interfaces";
import { Mediator, Mediator_Messages } from "./helper/Mediator";

declare var UAParser; // for the compiler

export class FeedbackCenter implements IFeedbackCenter {

    private factory: IFactory;
    private configuration: IConfig;
    private baseDiv: HTMLDivElement;
    private unsubmittedAnnotationUIElements: IAnnotationUIElement[] = [];
    private localStorageArray: ITicketStorage[] = [];
    private API_TICKETS_URL: string;
    private API_ALTERNATIVESSELECTION_URL: string;
    private finder: FeedbackCenterFinder;
    private currentViewedTicket: ITicket;
    private toggleCenterFunction;
    private alternativeAreas: IAlternativeAreaUIElement[] = [];

    constructor(factory: IFactory, configuration: IConfig) {
        this.factory = factory;
        this.configuration = configuration;
        this.API_TICKETS_URL = Constants.API_BASE_URL + configuration.projectCode + "/tickets";
        this.API_ALTERNATIVESSELECTION_URL = Constants.API_BASE_URL + configuration.projectCode + "/alternativesselections";
        this.create();
        this.registerToggleLogicPerModus();

        Mediator.RegisterHandler(Mediator_Messages.AnnotationDeleted, this.annotationDeleted.bind(this));
        Mediator.RegisterHandler(Mediator_Messages.RateAnnotation, this.tryEvaluateAnnotation.bind(this));
        Mediator.RegisterHandler(Mediator_Messages.ShowTicketDetails, (ticket) => {
            this.showViewingArea();
            this.fillAndShowComparisonArea(ticket, true);
            if (this.finder.getBodyDiv().classList.contains("fm__invisible")) {
                this.toggleCenterFunction();
            }
        });
    }

    public inject() {
        document.body.appendChild(this.baseDiv);
    }

    private create() {
        this.baseDiv = document.createElement("div");
        this.finder = new FeedbackCenterFinder(this.baseDiv);
        this.baseDiv.id = "fm__basediv-feedback-center";
        this.baseDiv.innerHTML = this.finder.getHTML();

        Helper.addCssClassRecursivly(this.baseDiv, "fm__initial");

        this.finder.getBackDiv().addEventListener("click", () => {
            if (this.finder.getAreaDiv().classList.contains("fm__invisible")) {
                this.finder.getHeadDiv().innerText = "Feedback Center";
                this.finder.getBackDiv().classList.add("fm__invisible");
                this.finder.getViewingAreaDiv().classList.add("fm__invisible");
                this.finder.getSendingAreaDiv().classList.add("fm__invisible");
                this.finder.getLandingAreaDiv().classList.remove("fm__invisible");
            } else {
                this.goBackFromComparisonArea();
            }
        }, false);

        this.finder.getShowSendingAreaButton().addEventListener("click", () => {
            this.finder.getHeadDiv().innerText = "Send Feedback";
            this.showSendingAreaGeneric();
            this.finder.getAddAnnotationButton().classList.remove("fm__invisible");
            if (this.unsubmittedAnnotationUIElements.length > 0) {
                this.finder.getSendButtonAndPublicCheckboxDiv().classList.remove("fm__invisible");
            }
            this.finder.getSendSelectionButton().classList.add("fm__invisible");
        }, false);

        this.finder.getShowViewingAreaButton().addEventListener("click", this.showViewingArea.bind(this), false);

        this.finder.getShowAlternativesButton().addEventListener("click", () => {
            for (let index = 0; index < this.alternativeAreas.length; index++) {
                this.alternativeAreas[index].show();
            }
            this.finder.getHeadDiv().innerText = "Send Selection";
            this.showSendingAreaGeneric();
            this.finder.getAddAnnotationButton().classList.add("fm__invisible");
            this.finder.getSendButtonAndPublicCheckboxDiv().classList.add("fm__invisible");
            this.finder.getSendSelectionButton().classList.remove("fm__invisible");
        }, false);

        this.finder.getSendSelectionButton().addEventListener("click", this.postSelection.bind(this), false);

        this.finder.getAddAnnotationButton().addEventListener("click", this.addAnnotation.bind(this), false);
        this.finder.getEmailInput().addEventListener("input", this.emailInputChanged.bind(this), false);
        this.finder.getIOTAAddressInput().addEventListener("input", this.iotaAddressInputChanged.bind(this), false);
        if (!this.configuration.allowPayment) {
            this.finder.getPaymentInfosDiv().classList.add("fm__invisible");
        }
        this.finder.getSendButton().addEventListener("click", this.submitTicket.bind(this), false);
        this.finder.getShowButton().addEventListener("click", this.showTicket.bind(this), false);
        this.finder.getShowPublicButton().addEventListener("click", this.showPublic.bind(this), false);
        const select = this.finder.getTicketIDSelect();
        select.selectedIndex = 0;
        select.addEventListener("change", this.ticketIDSelectChanged.bind(this), false);
        this.finder.getDeleteFromStorageButton().addEventListener("click", this.deleteFromStorage.bind(this), false);
        this.setlocalStorageArrayAndFillSelect();

        // search for alternatives
        let areas = document.querySelectorAll("[data-fm-area-name]");
        if (areas.length > 0) {
            for (let index = 0; index < areas.length; index++) {
                this.alternativeAreas.push(new AlternativeAreaUIElement(areas[index]))
            }
            this.finder.getShowAlternativeAreasDiv().classList.remove("fm__invisible");

            // if there is a View-Guid for selections in the Query-Params, then show it
            const guid = Helper.getParameterByName(window.location.href, Constants.QUERYPARAM_SELECTION_VIEWGUID);
            if (guid) {
                // set back URL, in case you open a ticket and instanly create new ones
                history.replaceState(null, document.title,
                    Helper.removeParameter(window.location.href, Constants.QUERYPARAM_SELECTION_VIEWGUID));
                this.loadSelectionByViewGuid(guid);
            }
        }

        window.addEventListener("resize", this.updateWindowDimensionLocal.bind(this), false); // this also listens for changes of zoom-level!
    }

    private showSendingAreaGeneric() {
        this.finder.getBackDiv().classList.remove("fm__invisible");
        this.finder.getViewingAreaDiv().classList.add("fm__invisible");
        this.finder.getSendingAreaDiv().classList.remove("fm__invisible");
        this.finder.getLandingAreaDiv().classList.add("fm__invisible");
    }

    private setlocalStorageArrayAndFillSelect(): void {

        this.finder.getTicketStorageExistsDiv().classList.add("fm__invisible");

        if (Helper.storageAvailable("localStorage")) {
            // 1. get storage array from storage if exists
            if (Constants.LOCALSTORAGE_TICKETSKEY in localStorage) {
                this.localStorageArray = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_TICKETSKEY)) as ITicketStorage[];

                const select = this.finder.getTicketIDSelect();
                // 2. Delete children if already exists except first entry
                for (let index = select.options.length - 1; index > 0; index--) {
                    select.remove(index);
                }

                // 3. fill select
                for (let index = 0; index < this.localStorageArray.length; index++) {
                    const ticket = this.localStorageArray[index] as ITicketStorage;
                    if (ticket.url == Helper.stripUrl(window.location.toString())) {
                        const option = document.createElement("option");
                        option.value = ticket.viewGuid;
                        option.innerText = new Date(ticket.sent).toLocaleString();
                        select.appendChild(option);
                    }
                }

                // 4. set visible if there are elements
                if (select.length > 1) {
                    this.finder.getTicketStorageExistsDiv().classList.remove("fm__invisible");
                }
            }
        }
    }

    //#region Eventhandler   

    private postSelection() {
        const areaInfoItems: IAreaInfoItem[] = [];

        for (let index = 0; index < this.alternativeAreas.length; index++) {
            const area = this.alternativeAreas[index];
            if (area.areaBaseIsVisibleAndFinished()) {
                areaInfoItems.push(area.getAreaInfoItem());
            }
        }

        if (areaInfoItems.length === 0) {
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated,
                {
                    header: "Nothing accepted yet!",
                    subheader: "You can accept an alternative with the red border by closing its overlay.",
                    text: ""
                });
            return;
        }

        const selection = {} as IAlternativesSelection;
        selection.name = this.finder.getNameInput().value;
        selection.email = this.finder.getEmailInput().value;
        selection.iotaAddress = this.finder.getIOTAAddressInput().value;
        selection.url = window.location.toString();
        selection.areaInfoItems = areaInfoItems;
        selection.sent = new Date().toISOString();

        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.API_ALTERNATIVESSELECTION_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            this.finder.getSpinnerSendDiv().classList.add("fm__invisible");
            switch (xhr.status) {
                case 201:
                    //const responseSelection = JSON.parse(xhr.responseText) as IAlternativesSelection;                    

                    for (let index = 0; index < this.alternativeAreas.length; index++) {
                        this.alternativeAreas[index].hide();
                    }

                    this.finder.getBackDiv().click();

                    Mediator.NotifyColleagues(Mediator_Messages.MessageCreated,
                        {
                            header: "Feedback submitted - thank you!",
                            subheader: "We will consider your selection.",
                            text: ""
                        });
                    break;
                default:
                    this.handleError(JSON.parse(xhr.responseText) as IModalMessage, xhr.status);
            }
        };
        xhr.onerror = () => {
            this.finder.getSpinnerSendDiv().classList.add("fm__invisible");
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated,
                {
                    header: "Connection error!",
                    subheader: "",
                    text: "Please try again."
                });
        };
        xhr.send(JSON.stringify(selection));
        this.finder.getSpinnerSendDiv().classList.remove("fm__invisible");
    }

    private showTicket() {
        this.finder.getTicketIDSelect().selectedIndex = 0;
        this.finder.getDeleteFromStorageButton().classList.add("fm__invisible");
        this.loadAndInsertExistingTicket(this.finder.getTicketViewIDInput().value, this.finder.getSpinnerShowSubmissionDiv());
    }

    private showPublic() {
        const spinner = this.finder.getSpinnerShowPublicSubmissionsDiv();

        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.API_TICKETS_URL + "/public", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            spinner.classList.add("fm__invisible");
            switch (xhr.status) {
                case 200:
                    const response = JSON.parse(xhr.responseText) as ITicket[];
                    for (let index = 0; index < response.length; index++) {
                        const element = response[index];
                        this.placeAnnotations(element, true);
                    }
                    break;
                default:
                    this.handleError(JSON.parse(xhr.responseText) as IModalMessage, xhr.status);
            }
        };
        xhr.onerror = () => {
            spinner.classList.add("fm__invisible");
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                header: "Connection error!",
                subheader: "",
                text: "Please try again."
            });
        };

        xhr.send(JSON.stringify({ url: location.href }));
        spinner.classList.remove("fm__invisible");
    }

    private showViewingArea() {
        this.finder.getHeadDiv().innerText = "View Feedback";
        this.finder.getBackDiv().classList.remove("fm__invisible");
        this.finder.getViewingAreaDiv().classList.remove("fm__invisible");
        this.finder.getSendingAreaDiv().classList.add("fm__invisible");
        this.finder.getLandingAreaDiv().classList.add("fm__invisible");
    }

    private goBackFromComparisonArea() {
        this.finder.getHeadDiv().innerText = "View Feedback";
        this.finder.getAreaDiv().classList.add("fm__invisible");
        this.finder.getViewingAreaDiv().classList.remove("fm__invisible");
    }

    private addAnnotation() {
        const annotationUIElement = this.factory.createAnnotationUIElement();
        this.unsubmittedAnnotationUIElements.push(annotationUIElement);
        annotationUIElement.inject();

        this.toogleSendButtonAndPublicCheckboxVisibility();
    }

    private submitTicket() {

        const annotations: IAnnotation[] = [];

        for (let index = 0; index < this.unsubmittedAnnotationUIElements.length; index++) {
            const annotation = this.unsubmittedAnnotationUIElements[index];
            annotations.push(annotation.getAnnotation());
        }

        const ticket = {} as ITicket;
        ticket.name = this.finder.getNameInput().value;
        ticket.email = this.finder.getEmailInput().value;
        ticket.iotaAddress = this.finder.getIOTAAddressInput().value;
        ticket.navigatorString = navigator.userAgent;
        ticket.browserFontSize = window.getComputedStyle(document.body, null).getPropertyValue("font-size");
        ticket.screenHeight = window.innerHeight;
        ticket.screenWidth = window.innerWidth;
        ticket.url = window.location.toString();
        ticket.annotations = annotations;
        ticket.sent = new Date().toISOString();
        ticket.isPublic = this.finder.getIsPublicCheckbox().checked;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.API_TICKETS_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            this.finder.getSpinnerSendDiv().classList.add("fm__invisible");
            switch (xhr.status) {
                case 201:
                    const responseTicket = JSON.parse(xhr.responseText) as ITicket;

                    for (let index = 0; index < annotations.length; index++) {
                        Mediator.NotifyColleagues(Mediator_Messages.AnnotationSendSucess, { guid: annotations[index].guid, isPublic: ticket.isPublic });
                    }

                    // Store into localStorage if possible
                    if (Helper.storageAvailable("localStorage")) {
                        const ticketToStore = {} as ITicketStorage; // a simple cast of response to ITicketStorage does not remove the properties of ITicket
                        ticketToStore.viewGuid = responseTicket.viewGuid;
                        ticketToStore.sent = responseTicket.sent;
                        ticketToStore.url = Helper.stripUrl(responseTicket.url);
                        this.localStorageArray.push(ticketToStore);
                        localStorage.setItem(Constants.LOCALSTORAGE_TICKETSKEY, JSON.stringify(this.localStorageArray));
                        this.setlocalStorageArrayAndFillSelect();
                    }

                    this.unsubmittedAnnotationUIElements.length = 0; // is like clearing
                    this.toogleSendButtonAndPublicCheckboxVisibility();
                    Mediator.NotifyColleagues(Mediator_Messages.MessageCreated,
                        {
                            header: "Feedback submitted - thank you!",
                            subheader: "Use the following ticket-ID at this url, to see it again:",
                            text: responseTicket.viewGuid
                        });
                    break;
                default:
                    this.handleError(JSON.parse(xhr.responseText) as IModalMessage, xhr.status);
            }
        };
        xhr.onerror = () => {
            this.finder.getSpinnerSendDiv().classList.add("fm__invisible");
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated,
                {
                    header: "Connection error!",
                    subheader: "",
                    text: "Please try again."
                });
        };
        xhr.send(JSON.stringify(ticket));
        this.finder.getSpinnerSendDiv().classList.remove("fm__invisible");
    }

    private loadAndInsertExistingTicket(viewGuid: string, spinner: HTMLDivElement) {
        if (viewGuid === "") {
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated,
                {
                    header: "Missing value!",
                    subheader: "",
                    text: "Please use a valid ticket-ID!"
                });
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("GET", this.API_TICKETS_URL + "/" + viewGuid, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            spinner.classList.add("fm__invisible");
            switch (xhr.status) {
                case 200:
                    const response = JSON.parse(xhr.responseText) as ITicket;
                    if (response.url != window.location.toString()) {
                        Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                            header: "The ticket-URL does not match!",
                            subheader: "For this ticket-ID, please use the following url:",
                            text: response.url
                        });
                        return;
                    }
                    this.placeAnnotations(response, false);
                    this.fillAndShowComparisonArea(response, false);
                    break;
                default:
                    this.handleError(JSON.parse(xhr.responseText) as IModalMessage, xhr.status);
            }
        };
        xhr.onerror = () => {
            spinner.classList.add("fm__invisible");
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                header: "Connection error!",
                subheader: "",
                text: "Please try again."
            });
        };
        xhr.send();
        spinner.classList.remove("fm__invisible");
    }

    private loadSelectionByViewGuid(viewGuid: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", this.API_ALTERNATIVESSELECTION_URL + "/" + viewGuid, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            switch (xhr.status) {
                case 200:
                    const response = JSON.parse(xhr.responseText) as IAlternativesSelection;
                    let notFoundAreas: string[] = [];
                    let notFoundAreaItems: string[] = [];
                    for (let index = 0; index < response.areaInfoItems.length; index++) {
                        const element = response.areaInfoItems[index];
                        // find area
                        const area = document.querySelector("[data-fm-area-name=\"" + element.name + "\"]");
                        if (area) {
                            // find alternatives
                            const alternativesItems = Helper.findAllDirectChildren(area, "[data-fm-area-item-title]") as NodeListOf<HTMLElement>;
                            let itemFound: boolean = false;
                            for (let innerIndex = 0; innerIndex < alternativesItems.length; innerIndex++) {
                                if (alternativesItems[innerIndex].getAttribute("data-fm-area-item-title") == element.choosenItemTitle) {
                                    alternativesItems[innerIndex].style.display = "inherit";
                                    itemFound = true;
                                }
                                else {
                                    alternativesItems[innerIndex].style.display = "none";
                                }
                            }
                            if (!itemFound) {
                                notFoundAreaItems.push(element.choosenItemTitle + "\" in area: \"" + element.name + "\"");
                            }
                        } else {
                            notFoundAreas.push(element.name);
                        }

                        if (notFoundAreas.length === 0 && notFoundAreaItems.length === 0) {
                            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                                header: "Selection applied!",
                                subheader: "",
                                text: "Close to view it."
                            });
                        }
                        else {
                            let subheader = "";
                            for (let index = 0; index < notFoundAreas.length; index++) {
                                subheader += "<b>Area:</b> \"" + notFoundAreas[index] + "\"<br /><br />";
                            }
                            for (let index = 0; index < notFoundAreaItems.length; index++) {
                                subheader += "<b>Item:</b> \"" + notFoundAreaItems[index] + "<br /><br />";
                            }
                            subheader = subheader.slice(0, -6);

                            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                                header: "Some elements weren't found!",
                                subheader: subheader,
                                text: ""
                            });
                        }
                    }
                    break;
                default:
                    this.handleError(JSON.parse(xhr.responseText) as IModalMessage, xhr.status);
            }
        };
        xhr.onerror = () => {
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                header: "Connection error!",
                subheader: "",
                text: "Please try again."
            });
        };
        xhr.send();
    }

    private deleteFromStorage() {
        const guid = this.finder.getTicketIDSelect().value;
        this.localStorageArray = this.localStorageArray.filter(function (item) {
            return item.viewGuid !== guid;
        });
        localStorage.setItem(Constants.LOCALSTORAGE_TICKETSKEY, JSON.stringify(this.localStorageArray));
        this.setlocalStorageArrayAndFillSelect();
        this.finder.getDeleteFromStorageButton().classList.add("fm__invisible"); // must be done

        this.goBackFromComparisonArea();
    }

    private emailInputChanged(e) {
        this.validateEmail();
    }

    private iotaAddressInputChanged(e) {
        this.validateIOTAAddress();
    }

    private ticketIDSelectChanged(e) {
        const select = this.finder.getTicketIDSelect();
        if (select.selectedIndex > 0) {
            this.loadAndInsertExistingTicket(select.value, this.finder.getSpinnerSelectDiv());
            this.finder.getDeleteFromStorageButton().classList.remove("fm__invisible");
        } else {
            this.finder.getDeleteFromStorageButton().classList.add("fm__invisible");
        }
    }

    //#endregion

    private handleError(responseError: IModalMessage, status?: number) {
        if (!responseError.header) {
            // some other error
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                header: "Error (Status code: " + status + ")",
                subheader: "",
                text: responseError
            });
        } else { // own error
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                header: responseError.header,
                subheader: responseError.subheader,
                text: responseError.text
            });
        }
    }

    private registerToggleLogicPerModus() {

        switch (this.configuration.modus) {
            case FeedbackCenter_Modus.UseQueryParam:
            case FeedbackCenter_Modus.UsePredefined:
                this.toggleCenterFunction = () => {
                    this.finder.getBodyDiv().classList.toggle("fm__invisible");
                    this.finder.getMiniHeaderDiv().classList.toggle("fm__invisible");
                };
                this.finder.getMiniHeaderDiv().addEventListener("click", this.toggleCenterFunction, false);
                this.finder.getHideDiv().addEventListener("click", this.toggleCenterFunction, false);
                break;

            case FeedbackCenter_Modus.UseExistingHTMLElement:

                this.finder.getMiniHeaderDiv().classList.add("fm__invisible");
                try {
                    this.toggleCenterFunction = () => {
                        this.finder.getBodyDiv().classList.toggle("fm__invisible");
                    };
                    this.configuration.targetElement.addEventListener("click", this.toggleCenterFunction, false);
                    this.finder.getHideDiv().addEventListener("click", this.toggleCenterFunction, false);
                } catch (error) {
                    Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                        header: "Error at event-registration",
                        subheader: "Could not register click-event on target-element",
                        text: ""
                    });
                }
                break;
        }

        // if there is a View-Guid for selections in the Query-Params, then show it
        const guid = Helper.getParameterByName(window.location.href, Constants.QUERYPARAM_TICKET_VIEWGUID);
        if (guid) {
            // set back URL, in case you open a ticket and instanly create new ones
            history.replaceState(null, document.title,
                Helper.removeParameter(window.location.href, Constants.QUERYPARAM_TICKET_VIEWGUID));
            this.toggleCenterFunction();
            this.showViewingArea();
            this.finder.getTicketViewIDInput().value = guid;
            this.showTicket();
        }
    }

    private annotationDeleted(guid: string) {
        this.unsubmittedAnnotationUIElements = this.unsubmittedAnnotationUIElements.filter(function (item) {
            return item.getAnnotation().guid !== guid;
        });

        this.toogleSendButtonAndPublicCheckboxVisibility();
    }

    private tryEvaluateAnnotation(rating: IAnnotationRatingStorage) {
        if (Helper.storageAvailable("localStorage")) {
            // 1. get storage array from storage if exists
            if (Constants.LOCALSTORAGE_RATEDANNOS_KEY in localStorage) {
                const localStorage_ratedAnnos = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_RATEDANNOS_KEY)) as IAnnotationRatingStorage[];

                for (let index = 0; index < localStorage_ratedAnnos.length; index++) {
                    const element = localStorage_ratedAnnos[index];
                    if (element.guid == rating.guid) {
                        Mediator.NotifyColleagues(Mediator_Messages.ResetAnnotationRating, rating.guid);
                        Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                            header: "Already rated before!",
                            subheader: "",
                            text: "Please do not rate this comment anymore!"
                        });
                        return;
                    }
                }
                this.doEvaluate(rating);
            } else {
                this.doEvaluate(rating);
            }
        } else {
            this.doEvaluate(rating);
        }
    }

    private doEvaluate(rating: IAnnotationRatingStorage) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.API_TICKETS_URL + "/rateannotation", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            switch (xhr.status) {
                case 200:
                    Mediator.NotifyColleagues(Mediator_Messages.AnnotationRatingSuccess, rating.rateValue);
                    Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                        header: "Rating submitted!",
                        subheader: "Thank you for your engagement.",
                        text: ""
                    });

                    // Store into localStorage if possible
                    if (Helper.storageAvailable("localStorage")) {

                        let localStorage_RatedAnnos: IAnnotationRatingStorage[] = [];
                        if (Constants.LOCALSTORAGE_RATEDANNOS_KEY in localStorage) {
                            localStorage_RatedAnnos =
                                JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_RATEDANNOS_KEY));
                        }
                        localStorage_RatedAnnos.push(rating);
                        localStorage.setItem(Constants.LOCALSTORAGE_RATEDANNOS_KEY,
                            JSON.stringify(localStorage_RatedAnnos));
                    }

                    break;
                default:
                    this.handleError(JSON.parse(xhr.responseText) as IModalMessage, xhr.status);
            }
        };
        xhr.onerror = () => {
            Mediator.NotifyColleagues(Mediator_Messages.MessageCreated, {
                header: "Connection error!",
                subheader: "",
                text: "Please try again."
            });
        };
        xhr.send(JSON.stringify(rating));
    }

    private toogleSendButtonAndPublicCheckboxVisibility() {

        const len = this.unsubmittedAnnotationUIElements.length;

        if (len > 0) {
            this.finder.getSendButton().innerText = "send " + len + " annotation" + (len > 1 ? "s" : "");
            this.finder.getSendButtonAndPublicCheckboxDiv().classList.remove("fm__invisible");
        } else {
            this.finder.getSendButtonAndPublicCheckboxDiv().classList.add("fm__invisible");
        }
    }

    private validateEmail() {
        const emailInput = this.finder.getEmailInput();
        if (emailInput.value) {
            const emailCheck = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

            if (emailCheck.test(emailInput.value)) {
                emailInput.classList.remove("fm__invalid");
                this.finder.getEmailInvalidDiv().classList.add("fm__invisible");
            } else {
                emailInput.classList.add("fm__invalid");
                this.finder.getEmailInvalidDiv().classList.remove("fm__invisible");
            }
        } else {
            emailInput.classList.remove("fm__invalid");
            this.finder.getEmailInvalidDiv().classList.add("fm__invisible");
        }
    }

    private validateIOTAAddress() {
        const iotaAddressInput = this.finder.getIOTAAddressInput();
        if (iotaAddressInput.value) {
            if (Helper.isIOTAAddress(iotaAddressInput.value)) {
                iotaAddressInput.classList.remove("fm__invalid");
                this.finder.getIOTAAddressInvalidDiv().classList.add("fm__invisible");
            } else {
                iotaAddressInput.classList.add("fm__invalid");
                this.finder.getIOTAAddressInvalidDiv().classList.remove("fm__invisible");
            }
        } else {
            iotaAddressInput.classList.remove("fm__invalid");
            this.finder.getIOTAAddressInvalidDiv().classList.add("fm__invisible");
        }
    }

    private placeAnnotations(ticket: ITicket, showDetailsLink: boolean) {
        for (let index = 0; index < ticket.annotations.length; index++) {
            const annotation = ticket.annotations[index];
            const annotationUIElement = this.factory.createAnnotationUIElement(annotation.guid);
            annotationUIElement.placeAnnotation(annotation, ticket, showDetailsLink);
        }
    }

    private fillAndShowComparisonArea(ticket: ITicket, privateMode: boolean) {
        this.currentViewedTicket = ticket;
        this.finder.getHeadDiv().innerText = "Ticket";
        this.finder.getGuidTD().innerText = ticket.viewGuid;
        this.finder.getPublicTD().innerText = ticket.isPublic ? "yes" : "no";
        this.finder.getSentAtTD().innerText = new Date(ticket.sent).toLocaleString();
        this.finder.getViewedAtTD().innerText = ticket.viewedAt ? new Date(ticket.viewedAt).toLocaleString() : "not viewed yet";
        this.finder.getAnnotationsCountTD().innerText = ticket.annotations.length.toString();

        if (privateMode) {
            this.finder.getPrivateTicketInfosTable().classList.add("fm__invisible");
            this.finder.getDeleteFromStorageButton().classList.add("fm__invisible");
        } else {
            this.finder.getNameTD().innerText = ticket.name ? ticket.name : "/";
            this.finder.getEmailTD().innerText = ticket.email ? ticket.email : "/";
            this.finder.getIOTAAddressTD().innerHTML = ticket.iotaAddress ? (`<a class="fm__text fm__link" href="https://thetangle.org/address/` + ticket.iotaAddress + `" target="_blank">` + ticket.iotaAddress + `</a>`) : "/";
            this.finder.getPrivateTicketInfosTable().classList.remove("fm__invisible");
        }

        this.finder.getWindowDimensionTicketDiv().innerText = ticket.screenWidth.toString() + " x " + ticket.screenHeight.toString();

        this.updateWindowDimensionLocal();

        if (typeof UAParser !== "undefined") {
            this.parseBrowserAndMore(ticket);
        }
        else {
            setTimeout(() => this.parseBrowserAndMore(ticket), 1500);
        }
    }

    private parseBrowserAndMore(ticket: ITicket) {
        const parserBrowserTicket = new UAParser(ticket.navigatorString).getBrowser();
        const parserBrowserLocal = new UAParser(navigator.userAgent).getBrowser();

        this.finder.getBrowserTicketDiv().innerText = parserBrowserTicket.name + " " + parserBrowserTicket.version.split(".")[0];
        this.finder.getBrowserLocalDiv().innerText = parserBrowserLocal.name + " " + parserBrowserLocal.version.split(".")[0];

        const localFontSize = window.getComputedStyle(document.body, null).getPropertyValue("font-size");
        const localFontSizeInt = parseInt(localFontSize, 10);
        const ticketFontSizeInt = parseInt(ticket.browserFontSize, 10);
        if (localFontSizeInt !== ticketFontSizeInt) {
            this.finder.getBrowserFontSizeLocalDiv().classList.add("fm__text_error");
        } else {
            this.finder.getBrowserFontSizeLocalDiv().classList.remove("fm__text_error");
        }
        this.finder.getBrowserFontSizeTicketDiv().innerText = ticket.browserFontSize;
        this.finder.getBrowserFontSizeLocalDiv().innerText = localFontSize;

        this.finder.getAreaDiv().classList.remove("fm__invisible");
        this.finder.getViewingAreaDiv().classList.add("fm__invisible");
    }

    private updateWindowDimensionLocal() {
        if (this.currentViewedTicket) {
            if (this.currentViewedTicket.screenWidth > (window.innerWidth - window.innerWidth * 0.015)
                && this.currentViewedTicket.screenWidth < (window.innerWidth + window.innerWidth * 0.015)) {
                this.finder.getWindowDimensionLocalWidthDiv().classList.remove("fm__text_error");
            } else {
                this.finder.getWindowDimensionLocalWidthDiv().classList.add("fm__text_error");
            }
            if (this.currentViewedTicket.screenHeight > (window.innerHeight - window.innerHeight * 0.05)
                && this.currentViewedTicket.screenHeight < (window.innerHeight + window.innerHeight * 0.05)) {
                this.finder.getWindowDimensionLocalHeightDiv().classList.remove("fm__text_error");
            } else {
                this.finder.getWindowDimensionLocalHeightDiv().classList.add("fm__text_error");
            }
        }
        this.finder.getWindowDimensionLocalWidthDiv().innerText = window.innerWidth.toString();
        this.finder.getWindowDimensionLocalHeightDiv().innerText = window.innerHeight.toString();
    }
}
