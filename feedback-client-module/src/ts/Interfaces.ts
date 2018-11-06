import { FeedbackCenter_Modus } from "./Enums";

export interface IConfig {
    projectCode: string;
    modus?: FeedbackCenter_Modus;
    targetElement?: HTMLElement;
    locationOfCSSFile?: string; /* if given, the module will insert a <style>-tag automatically, can be absolute or relative */
    allowPayment: boolean;
}

export interface IAnnotationRating {
    rateValue: number;
}

export interface IAnnotation {
    guid: string;
    comment: string;
    top: number;
    left: number;
    ratings: IAnnotationRating[];
}

export interface IAnnotationRatingStorage {
    guid: string;
    rateValue: string;
}

export interface ITicketStorage {
    viewGuid: string;
    sent: string; // better than Date for storing
    url: string; // because localStorage is related to the domain - but not to the URL
}

export interface ITicket extends ITicketStorage {
    name: string;
    email: string;
    iotaAddress: string;
    navigatorString: string;
    browserFontSize: string;
    screenHeight: number;
    screenWidth: number;
    annotations: IAnnotation[];
    isPublic: boolean;
    viewedAt: string;
}

export interface IKeyedCollection<T> {
    Add(key: string, value: T);
    ContainsKey(key: string): boolean;
    Count(): number;
    Item(key: string): T;
    Keys(): string[];
    Remove(key: string): T;
    Values(): T[];
}

interface IInjectable {
    inject();
}

export interface IAnnotationUIElement extends IInjectable {
    getAnnotation(): IAnnotation;
    placeAnnotation(annotation: IAnnotation, ticket: ITicket, showDetailsLink: boolean);
}

export interface IFeedbackCenter extends IInjectable {
}

export interface IAlternativeAreaUIElement {
    show();
    hide();
    getAreaInfoItem(): IAreaInfoItem;
    areaBaseIsVisibleAndFinished(): boolean;
}

export interface IModal extends IInjectable {
}

export interface IModalMessage {
    header: string;
    subheader: string;
    text: string;
}

export interface IFactory {
    createAnnotationUIElement(id?: string): IAnnotationUIElement;
}

export interface IAreaInfoItem {
    name: string;
    choosenItemTitle: string;
    comment: string;
}

export interface IAlternativesSelection {
    name: string;
    email: string;
    iotaAddress: string;
    url: string;
    areaInfoItems: IAreaInfoItem[];
    sent: string;
}
