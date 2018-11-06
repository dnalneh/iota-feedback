export function injectCSS(locationOfCSSFile: string) {
    const linkNode = document.createElement("link");
    linkNode.setAttribute("rel", "stylesheet");
    linkNode.setAttribute("type", "text/css");
    linkNode.setAttribute("href", locationOfCSSFile);
    document.getElementsByTagName("head")[0].appendChild(linkNode);
}

export function injectUAParserJS() {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://cdn.jsdelivr.net/npm/ua-parser-js@0/dist/ua-parser.min.js";
    document.getElementsByTagName("body")[0].appendChild(script);
}
