import { IAlternativeAreaUIElement, IAreaInfoItem } from "./Interfaces";
import * as Helper from "./helper/Helper";

export class AlternativeAreaUIElement implements IAlternativeAreaUIElement {

    private baseDiv: HTMLDivElement;
    private areaBaseElement: HTMLElement;
    private alternativesItems: NodeListOf<HTMLElement>;

    constructor(area) {
        this.areaBaseElement = area;
        this.alternativesItems = Helper.findAllDirectChildren(this.areaBaseElement, "[data-fm-area-item-title]") as NodeListOf<HTMLElement>;
        this.createBaseDiv();
    }

    show() {
        // set selectedIndex again, if something has changed, for example by a calling with Queryparam "QUERYPARAM_SELECTION_VIEWGUID"
        let indexToChoose = 0;
        for (let index = 0; index < this.alternativesItems.length; index++) {
            const element = this.alternativesItems[index];
            if (window.getComputedStyle(element, null).getPropertyValue("display") != "none") {
                indexToChoose = index;
                break;
            }
        }
        this.getAlternativesSelect().selectedIndex = indexToChoose; // btw: change event will not be triggered here

        this.areaBaseElement.classList.add("fm__alternative_area");
        this.baseDiv.classList.remove("fm__invisible");
    }

    hide() {
        this.areaBaseElement.classList.remove("fm__alternative_area");
        this.baseDiv.classList.add("fm__invisible");
    }

    getAreaInfoItem(): IAreaInfoItem {
        const areaInfoItem = {} as IAreaInfoItem;
        areaInfoItem.name = this.areaBaseElement.getAttribute("data-fm-area-name");;
        areaInfoItem.choosenItemTitle = this.alternativesItems[this.getAlternativesSelect().selectedIndex].getAttribute("data-fm-area-item-title");
        areaInfoItem.comment = this.getTextAreaComment().value;
        return areaInfoItem;
    }

    areaBaseIsVisibleAndFinished(): boolean {
        return window.getComputedStyle(this.areaBaseElement).display !== 'none' && !this.areaBaseElement.classList.contains("fm__alternative_area");
    }

    private createBaseDiv() {
        this.baseDiv = document.createElement("div");
        this.baseDiv.className = "fm__alternative_area_basediv fm__invisible";
        this.baseDiv.innerHTML = `
            <div class="fm__body">
                <div class="fm__close_x"></div>
                <div class="fm__head fm__text fm__unselectable">Choose an alternative<br/>and then close this to accept</div>
                <select class="fm__select fm__select_alternatives">
                </select>
                <div class="fm__showdescription fm__text fm__unselectable fm__link">Show description</div>
                <div class="fm__description fm__text fm__unselectable fm__invisible"></div>
                <div class="fm__addcomment fm__text fm__unselectable fm__link">Add comment</div>
                <textarea class="fm__textarea fm__textarea_comment fm__invisible"></textarea>
            </div>`;

        Helper.addCssClassRecursivly(this.baseDiv, "fm__initial");

        this.getCloseDiv().addEventListener("click", () => {
            this.hide();
        }, false);

        const select = this.getAlternativesSelect();
        // just fill, not setting selectedIndex here
        for (let index = 0; index < this.alternativesItems.length; index++) {
            const element = this.alternativesItems[index];
            const title = element.getAttribute("data-fm-area-item-title");
            const option = document.createElement("option");

            option.value = title;
            option.innerText = title;
            select.appendChild(option);
        }
        select.addEventListener("change", this.alternativesSelectChanged.bind(this), false);

        this.getDescriptionDiv().innerText = this.areaBaseElement.getAttribute("data-fm-area-description");

        this.getShowDescriptionDiv().addEventListener("click", () => {
            this.getDescriptionDiv().style.width = (parseInt(window.getComputedStyle(this.baseDiv, null).getPropertyValue("width"), 10) - 60) + "px";
            this.getDescriptionDiv().classList.remove("fm__invisible");
            this.getShowDescriptionDiv().classList.add("fm__invisible");
        }
            , false);

        this.getAddCommentDiv().addEventListener("click", () => {
            this.getTextAreaComment().style.width = (parseInt(window.getComputedStyle(this.baseDiv, null).getPropertyValue("width"), 10) - 60) + "px";
            this.getTextAreaComment().classList.remove("fm__invisible");
            this.getAddCommentDiv().classList.add("fm__invisible");
        }
            , false);

        this.areaBaseElement.appendChild(this.baseDiv);
    }

    private alternativesSelectChanged() {
        const select = this.getAlternativesSelect();
        for (let index = 0; index < this.alternativesItems.length; index++) {
            if (this.alternativesItems[index].getAttribute("data-fm-area-item-title") == select.value) {
                this.alternativesItems[index].style.display = "inherit";
            }
            else {
                this.alternativesItems[index].style.display = "none";
            }
        }
    }

    //#region Getters for HTML-Elements
    private getCloseDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__close_x");
    }

    private getAlternativesSelect() {
        return this.getFirstByClassName<HTMLSelectElement>("fm__select_alternatives");
    }

    private getShowDescriptionDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__showdescription");
    }

    private getDescriptionDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__description");
    }

    private getAddCommentDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__addcomment");
    }

    private getTextAreaComment() {
        return this.getFirstByClassName<HTMLTextAreaElement>("fm__textarea_comment");
    }

    private getFirstByClassName<T extends HTMLElement>(className: string): T {
        return this.baseDiv.getElementsByClassName(className)[0] as T;
    } //#endregion
}
