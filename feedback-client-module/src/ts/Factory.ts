import { AnnotationUIElement } from "./AnnotationUIElement";
import { IFactory } from "./Interfaces";

export class Factory implements IFactory {

    public createAnnotationUIElement(id?: string) {
        return new AnnotationUIElement(id);
    }
}
