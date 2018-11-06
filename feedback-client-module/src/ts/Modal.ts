import * as Helper from "./helper/Helper";
import { IModal, IModalMessage } from "./Interfaces";
import { Mediator, Mediator_Messages } from "./helper/Mediator";

export class Modal implements IModal {

    private baseDiv: HTMLDivElement;

    constructor() {

        this.baseDiv = document.createElement("div");
        this.baseDiv.className = "fm__modalDialog fm__invisible";
        this.baseDiv.innerHTML =
            `
            <div class="fm__modalbody">
                <span class="fm__close fm__modal_close">&times;</span>
                <div class="fm__modal_header fm__text fm__unselectable"></div>
                <div class="fm__modal_subheader fm__text fm__unselectable"></div>
                <div class="fm__modal_text fm__text"></div>
            </div>
             `;

        Helper.addCssClassRecursivly(this.baseDiv, "fm__initial");

        this.getModalCloseSpan().addEventListener("click", () => {
            this.baseDiv.classList.add("fm__invisible");
        }, false);
    }

    public inject() {
        document.body.appendChild(this.baseDiv);

        Mediator.RegisterHandler(Mediator_Messages.MessageCreated, this.showModal.bind(this));
    }

    private showModal(message: IModalMessage) {
        this.getModalHeaderDiv().innerText = message.header;
        if (message.subheader.indexOf("<br />") === -1) {
            this.getModalSubHeaderDiv().innerText = message.subheader;
        } else {
            this.getModalSubHeaderDiv().innerHTML = message.subheader;
        }
        this.getModalTextDiv().innerText = message.text;
        if (message.text != "") {
            this.getModalTextDiv().classList.remove("fm__invisible");
        } else {
            this.getModalTextDiv().classList.add("fm__invisible");
        }
        this.baseDiv.classList.remove("fm__invisible");
    }

    //#region Getters for HTML-Elements   

    private getModalCloseSpan() {
        return this.getFirstByClassName<HTMLSpanElement>("fm__modal_close");
    }

    private getModalHeaderDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__modal_header");
    }

    private getModalSubHeaderDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__modal_subheader");
    }

    private getModalTextDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__modal_text");
    }

    private getFirstByClassName<T extends HTMLElement>(className: string): T {
        return this.baseDiv.getElementsByClassName(className)[0] as T;
    }

    //#endregion
}
