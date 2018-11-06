export function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}

export function addCssClassRecursivly(node, className) {

    const func = (currentNode) => {
        if (currentNode.className) {
            try {
                currentNode.className = className + " " + currentNode.className;
            } catch (error) {

            }
        }
    };
    walkTheDOM(node, func);
}

export function isIOTAAddress(address: string): boolean {
    if (!(typeof address === "string")) {
        return false;
    }

    /*
       checks if input is correct trytes consisting of A-Z9
       optionally validate length
    */
    const isTrytes = (trytes: string, length: number): boolean => {
        const regexTrytes = new RegExp("^[9A-Z]{" + length + "}$");
        return typeof trytes === "string" && regexTrytes.test(trytes);
    };

    // Check if address with checksum
    if (address.length === 90) {

        if (!isTrytes(address, 90)) {
            return false;
        }
    } else {

        if (!isTrytes(address, 81)) {
            return false;
        }
    }

    return true;
}

export function storageAvailable(type) {
    let storage;
    const x = "__storage_test__";

    try {
        storage = window[type];
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === "QuotaExceededError" ||
            // Firefox
            e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

export function getParameterByName(url, name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return "";
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function removeParameter(url, parameter) {
    const fragment = url.split("#");
    const urlparts = fragment[0].split("?");

    if (urlparts.length >= 2) {
        const urlBase = urlparts.shift(); // get first part, and remove from array
        const queryString = urlparts.join("?"); // join it back up

        const prefix = encodeURIComponent(parameter) + "=";
        const pars = queryString.split(/[&;]/g);
        for (let i = pars.length; i-- > 0;) {               // reverse iteration as may be destructive
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {   // idiom for string.startsWith
                pars.splice(i, 1);
            }
        }
        url = urlBase + (pars.length > 0 ? "?" + pars.join("&") : "");
        if (fragment[1]) {
            url += "#" + fragment[1];
        }
    }
    return url;
}

export function stripUrl(urlToStrip) {
    let stripped = urlToStrip.split('?')[0];
    stripped = stripped.split('&')[0];
    stripped = stripped.split('#')[0];
    return stripped;
}

/**
 * Find direct children to node, replicating .querySelector(':scope > [...]')
 */
export function findDirectChild(node, selector) {
    let removeId = false

    if (node.getAttribute('id') === null) {
        node.setAttribute('id', 'ID_' + new Date().getTime())
        removeId = true
    }

    let result = document.querySelector('#' + node.getAttribute('id') + ' > ' + selector)

    if (removeId)
        node.removeAttribute('id')

    return result
}

/**
 * Find direct children to node, replicating .querySelectorAll(':scope > [...]')
 */
export function findAllDirectChildren(node, selector) {
    let removeId = false

    if (node.getAttribute('id') === null) {
        node.setAttribute('id', 'ID_' + new Date().getTime())
        removeId = true
    }

    let result = document.querySelectorAll('#' + node.getAttribute('id') + ' > ' + selector)

    if (removeId)
        node.removeAttribute('id')

    return result
}
