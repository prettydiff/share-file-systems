
/* lib/browser/utilities/configuration_radio - A tool to dynamically organize a list of input elements into a collection of radio buttons. */

const configuration_radio = function browser_utilities_configurationRadio(element:HTMLElement):void {
    const parent:HTMLElement = element.parentNode,
        grandParent:HTMLElement = parent.parentNode,
        labels:HTMLCollectionOf<Element> = grandParent.getElementsByTagName("label"),
        length:number = labels.length;
    let a:number = 0;
    do {
        labels[a].setAttribute("class", "radio");
        a = a + 1;
    } while (a < length);
    parent.setAttribute("class", "radio-checked");
};

export default configuration_radio;