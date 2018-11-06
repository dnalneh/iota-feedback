import { DragDropHelper } from "./helper/DragDropHelper";
import { Guid } from "./helper/Guid";
import * as Helper from "./helper/Helper";
import { IAnnotation, IAnnotationRatingStorage, IAnnotationUIElement, ITicket } from "./Interfaces";
import { Mediator, Mediator_Messages } from "./helper/Mediator";

export class AnnotationUIElement implements IAnnotationUIElement {

    private baseDiv: HTMLDivElement;
    private dragDropHelper: DragDropHelper = new DragDropHelper();
    private initialRating: number = 0;
    private ticket: ITicket;

    constructor(id?: string) {
        this.createBaseDiv(id);

        Mediator.RegisterHandler(Mediator_Messages.AnnotationSendSucess, this.checkGuidAndFinalize.bind(this));
        Mediator.RegisterHandler(Mediator_Messages.ResetAnnotationRating, this.resetAnnotationRating.bind(this));
        Mediator.RegisterHandler(Mediator_Messages.AnnotationRatingSuccess,
            (rateValue) => this.initialRating = rateValue);
    }

    public inject() {
        this.baseDiv.style.top = (window.scrollY + (window.innerHeight / 2) - 25/*half of height*/) + "px";
        this.baseDiv.style.left = (window.scrollX + (window.innerWidth / 2) - 164/*half of width*/) + "px";

        document.body.appendChild(this.baseDiv);

        this.getTextArea().focus();
    }

    public getAnnotation(): IAnnotation {

        const annotation = {} as IAnnotation;
        annotation.guid = this.baseDiv.id;
        annotation.comment = this.getTextArea().value;
        annotation.left = parseInt(this.baseDiv.style.left, 10);
        annotation.top = parseInt(this.baseDiv.style.top, 10);

        return annotation;
    }

    public placeAnnotation(annotation: IAnnotation, ticket: ITicket, showDetailsLink: boolean) {
        this.baseDiv.id = annotation.guid;
        this.getTextArea().value = annotation.comment;
        this.baseDiv.style.left = annotation.left.toString() + "px";
        this.baseDiv.style.top = annotation.top.toString() + "px";

        if (ticket.isPublic) {
            let avg = 0.0;
            for (let index = 0; index < annotation.ratings.length; index++) {
                avg += annotation.ratings[index].rateValue;
            }
            if (annotation.ratings.length > 0) {
                avg = Math.round(avg / annotation.ratings.length);
                this.setRating(avg);
            }
        }

        if (showDetailsLink) {
            this.ticket = ticket;
            this.getDetailsDiv().classList.remove("fm__invisible");
        }

        this.finalizeAnnotation(ticket.isPublic);
        document.getElementsByTagName("body")[0].appendChild(this.baseDiv);
    }

    //#region Eventhandler

    private close_annotation(e) {
        const evt = e || window.event;
        const elem = (evt.target) ? evt.target : evt.srcElement;
        elem.parentNode.parentNode.parentNode.removeChild(elem.parentNode.parentNode);

        Mediator.NotifyColleagues(Mediator_Messages.AnnotationDeleted, this.baseDiv.id);

        return false;
    }

    private toggle_hide_annotation() {
        this.getBodyDiv().classList.toggle("fm__invisible");
        this.getBody_MinimizedDiv().classList.toggle("fm__invisible");
    }

    //#endregion

    private createBaseDiv(id?: string) {
        this.baseDiv = document.createElement("div");
        if (id) {
            this.baseDiv.id = id;
        } else {
            this.baseDiv.id = Guid.newGuid();
        }
        this.baseDiv.className = "fm__basediv-annotation-ui-element";
        this.baseDiv.innerHTML =
            `<span class="fm__tip fm__tip-up-white"></span>
             <span class="fm__tip fm__tip-up"></span>
             <div class="fm__body_minimized fm__invisible"></div>
             <div class="fm__body">
                <div class="fm__close">&times;</div>
                <div class="fm__evaluation fm__invisible">
                    <input type="radio"><i></i>
                    <input type="radio"><i></i>
                    <input type="radio"><i></i>
                    <input type="radio"><i></i>
                    <input type="radio"><i></i>
                </div>
                <div class="fm__head fm__unselectable">Comment: (moveable)</div>
                <div class="fm__link fm__detailslink fm__text fm__unselectable fm__invisible">Details</div>
                <textarea class="fm__textarea"></textarea>
             </div>
            `;
        Helper.addCssClassRecursivly(this.baseDiv, "fm__initial");

        this.dragDropHelper.initElement(this.baseDiv);

        const inputs = this.getEvaluationDiv().getElementsByTagName("input");
        for (let index = 0; index < inputs.length; index++) {
            const input = inputs[index];
            input.name = this.baseDiv.id;
            input.id = this.baseDiv.id + index.toString();
            input.addEventListener("click", () => {
                const rating = {} as IAnnotationRatingStorage;
                rating.guid = this.baseDiv.id;
                rating.rateValue = (index + 1).toString();
                Mediator.NotifyColleagues(Mediator_Messages.RateAnnotation, rating);
            }, false);
        }

        this.getCloseSpan().addEventListener("click", this.close_annotation.bind(this), false);
        this.getBody_MinimizedDiv().addEventListener("click", this.toggle_hide_annotation.bind(this), false);
        this.getDetailsDiv().addEventListener("click", () => {
            Mediator.NotifyColleagues(Mediator_Messages.ShowTicketDetails, this.ticket);
        }, false);
    }

    private checkGuidAndFinalize(data) {
        if (data.guid === this.baseDiv.id) { // listen only when relevant
            this.finalizeAnnotation(data.isPublic);
        }
    }

    private resetAnnotationRating(guid) {
        if (guid === this.baseDiv.id) { // listen only when relevant
            this.setRating(this.initialRating);
        }
    }

    private setRating(rateValue) {
        const inputs = this.getEvaluationDiv().getElementsByTagName("input");
        for (let index = 0; index < inputs.length; index++) {
            if (index == (rateValue - 1)) {
                inputs[index].checked = true;
                this.initialRating = rateValue;
                return;
            }
        }
    }

    private finalizeAnnotation(showRating: boolean) {
        this.dragDropHelper.releaseElement(this.baseDiv);
        this.getBodyDiv().classList.add("fm__sent");
        this.getTextArea().readOnly = true;
        this.getCloseSpan().style.display = "none";
        const span = this.getTipSpan();
        span.addEventListener("click", this.toggle_hide_annotation.bind(this), false);
        span.style.cursor = "pointer";

        this.getHeadSpan().innerText = "Comment:";

        if (showRating) {
            this.getEvaluationDiv().classList.remove("fm__invisible");
        }
    }

    //#region Getters for HTML-Elements

    private getTextArea() {
        return this.getFirstByClassName<HTMLTextAreaElement>("fm__textarea");
    }

    private getCloseSpan() {
        return this.getFirstByClassName<HTMLSpanElement>("fm__close");
    }

    private getBody_MinimizedDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__body_minimized");
    }

    private getBodyDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__body");
    }

    private getTipSpan() {
        return this.getFirstByClassName<HTMLSpanElement>("fm__tip-up");
    }

    private getHeadSpan() {
        return this.getFirstByClassName<HTMLSpanElement>("fm__head");
    }

    private getDetailsDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__detailslink");
    }
    private getEvaluationDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__evaluation");
    }

    private getFirstByClassName<T extends HTMLElement>(className: string): T {
        return this.baseDiv.getElementsByClassName(className)[0] as T;
    }

    //#endregion
}
