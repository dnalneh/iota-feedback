import { KeyedCollection } from "./KeyedCollection";

export const enum Mediator_Messages {
    AnnotationDeleted = "AnnotationDeleted",
    AnnotationSendSucess = "AnnotationSendSucess",
    MessageCreated = "MessageCreated",
    RateAnnotation = "RateAnnotation",
    ResetAnnotationRating = "ResetAnnotationRating",
    AnnotationRatingSuccess = "AnnotationRatingSuccess",
    ShowTicketDetails = "ShowTicketDetails"
}

export class Mediator {

    private static handlerCollection = new KeyedCollection<any[]>();

    public static RegisterHandler(key: string, handler): void {

        if (!this.handlerCollection.ContainsKey(key)) {
            this.handlerCollection.Add(key, [handler]);
        } else {
            this.handlerCollection.Item(key).push(handler);
        }
    }

    // public static UnregisterHandler(key: string, handler): void {
    //     if (this.handlerCollection.ContainsKey(key)) {
    //         const arr = this.handlerCollection.Item(key);

    //         for (let index = 0; index < arr.length; index++) {
    //             if (arr[index] === handler) {
    //                 arr.splice(index, 1);
    //                 return;
    //             }
    //         }

    //         console.log("Mediator: handler not in list");
    //     }
    //     else {
    //         console.log("Mediator: unexpected key");
    //     }
    // }

    public static NotifyColleagues(key: string, message?: any) {
        if (this.handlerCollection.ContainsKey(key)) {
            const arr = this.handlerCollection.Item(key);

            for (let index = 0; index < arr.length; index++) {
                arr[index](message);
            }
        }
    }
}
