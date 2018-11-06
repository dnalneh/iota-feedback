export class DragDropHelper {
    private initialMouseX: number = undefined;
    private initialMouseY: number = undefined;
    private startX: number = undefined;
    private startY: number = undefined;
    private draggedObject: HTMLElement = undefined;
    private eventsRegistered: boolean = false;
    private mouseMoveListener = undefined;
    private mouseUpListener = undefined;

    public initElement(element: HTMLElement) {
        this.registerDragAndDropTouchToMouseMapping(element);
        element.onmousedown = this.startDragMouse.bind(this);
        this.draggedObject = element;
    }

    public releaseElement(element: HTMLElement) {
        element.onmousedown = undefined;
    }

    private startDragMouse(e) {
        this.startDrag();
        const evt = e || window.event;
        const elem = (evt.target) ? evt.target : evt.srcElement;
        const tag = elem.tagName.toUpperCase();

        // register only for divs etc
        if (tag !== "TEXTAREA" && tag !== "BUTTON") {
            this.initialMouseX = evt.clientX;
            this.initialMouseY = evt.clientY;
            this.mouseMoveListener = this.dragMouse.bind(this);
            this.mouseUpListener = this.releaseEvents.bind(this);
            document.addEventListener("mousemove", this.mouseMoveListener, false);
            document.addEventListener("mouseup", this.mouseUpListener, false);
            this.eventsRegistered = true;
            return false;
        } else {
            return true;
        }
    }

    private startDrag() {
        if (this.eventsRegistered) {
            this.releaseEvents();
        }
        this.startX = this.draggedObject.offsetLeft;
        this.startY = this.draggedObject.offsetTop;
    }

    private dragMouse(e) {
        const evt = e || window.event;
        const dX = evt.clientX - this.initialMouseX;
        const dY = evt.clientY - this.initialMouseY;
        this.setPosition(dX, dY);
        return false;
    }

    private setPosition(dx, dy) {
        this.draggedObject.style.left = (this.startX + dx) + "px";
        this.draggedObject.style.top = (this.startY + dy) + "px";
    }

    private releaseEvents() {
        document.removeEventListener("mousemove", this.mouseMoveListener, false);
        document.removeEventListener("mouseup", this.mouseUpListener, false);
        this.eventsRegistered = false;
    }

    private registerDragAndDropTouchToMouseMapping(element: HTMLElement) {
        // touch to mouseevents

        function touchHandler(event) {
            const touches = event.changedTouches;
            const first = touches[0];
            let type = "";
            switch (event.type) {
                case "touchstart": type = "mousedown"; break;
                case "touchmove":
                    type = "mousemove";
                    event.preventDefault(); /*this prevents pull-to-refresh on chrome*/
                    break;
                case "touchend": type = "mouseup"; break;
                default: return;
            }

            const simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent(type, true, true, window, 1,
                first.screenX, first.screenY,
                first.clientX, first.clientY, false,
                false, false, false, 0/*left*/, null);
            first.target.dispatchEvent(simulatedEvent);
        }

        element.addEventListener("touchstart", touchHandler, true);
        element.addEventListener("touchmove", touchHandler, true);
        element.addEventListener("touchend", touchHandler, true);
    }
}
