
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
console.log("Spike content script started");



// IE and Google Chrome Support
// if (window.getSelection) {  // all browsers, except IE before version 9
//     var range = window.getSelection();
//   console.log(range);
// } 
// else {
//     if (document.selection.createRange) { // Internet Explorer
//         var range = document.selection.createRange();
//         console.log(range);
//     }
// }

//Highlight and save Functionality
var selectionChangeTimer = null;
var obj = {};
var notes=[];

document.addEventListener("selectionchange", handleSelectionChange, false);
var redrawTimer = null;
window.addEventListener("scroll", redrawSelectionBoxes, false);
window.addEventListener("resize", redrawSelectionBoxes, false);
function handleSelectionChange() {
    var selectionString = window.getSelection().toString();
    if (selectionString) {
        if (selectionString[0].length > 0) {
            clearTimeout(selectionChangeTimer);
            selectionChangeTimer = setTimeout(drawSelectionBoxes, 300);
        }

    } else {

        return;
    }
}


// I debounce the redrawing of the selection boxes.
function redrawSelectionBoxes(event) {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(drawSelectionBoxes, 100);
}


// I clear the fixed-position selection boxes that outline the current selection
// within the document.
function clearCurrentSelectionBoxes() {
    var nodes = document.querySelectorAll("div.bounding-rect, div.segment-rect, div.text-fields");
     for (var i = 0; i < nodes.length; i++) {
        nodes[i].parentNode.removeChild(nodes[i]);
    }

}


// I draw the rectangles around the various Selection ranges.
function drawSelectionBoxes() {
    clearCurrentSelectionBoxes();
    var selection = window.getSelection();
    // If the selection doesn't represent a range, let's ignore it.
    // --
    // NOTE: I'd rather use the "type" property (None, Range, Caret); however, in
    // my testing, this does not appear to be supported in IE. As such, we'll use
    // the rangeCount and test the range dimensions).
    if (!selection.toString().length>0) {
        clearCurrentSelectionBoxes();
        return;
    }else{

    // Technically, a selection can have multiple ranges, as defined in the
    // "Selection.rangeCount" property; but, for the most part, we are only going
    // to deal with the first (and often only) selection range.
    var range = selection.getRangeAt(0);
    var rect = range.getBoundingClientRect();

    // Check to make sure the selection dimensions aren't zero.
    if (rect.width && rect.height ) {

        var outline = document.createElement("div");

        outline.classList.add("bounding-rect");
        outline.style.top = (rect.top + "px");
        outline.style.left = (rect.left + "px");
        outline.style.width = (rect.width + "px");
        outline.style.height = (rect.height + "px");
        outline.style.border = "0px solid grey";
        outline.style.position = "fixed";
        outline.style.zIndex = 20;
        obj.selection= selection;
        obj.range= range;
        obj.eachElementCoordinates= range.getClientRects();
        obj.selectedText = window.getSelection().toString();
        obj.coordinates = range.getBoundingClientRect();
        obj.location= window.location;
        outline.appendChild(createDiv(obj));
        document.body.appendChild(outline);

    }

    var rects = range.getClientRects();
    for (var i = 0; i < rects.length; i++) {

        var rect = rects[i];
        // Check to make sure the selection dimensions aren't zero.
        if (rect.width && rect.height) {

            var outline = document.createElement("div");
            outline.classList.add("segment-rect");
            outline.style.top = (rect.top + "px");
            outline.style.left = (rect.left + "px");
            outline.style.width = (rect.width + "px");
            outline.style.height = (rect.height + "px");
            outline.style.border = "1px dotted  blue";
            outline.style.position = "fixed";
            outline.style.zIndex = 13;
            document.body.appendChild(outline);
        }

    }
}
}


function createDiv(obj) {
    var container = document.createElement('div');
    container.classList.add('text-fields')
    var input = document.createElement("input");
    var saveButton = document.createElement('input');
    var cancelButton = document.createElement('input');
    input.setAttribute("type", "text");
    input.setAttribute("name", "notename");
    input.setAttribute("placeholder", "Note Name");
    saveButton.setAttribute('type', 'button');
    saveButton.setAttribute('value', 'Save');
    cancelButton.setAttribute('type', 'button');
    cancelButton.setAttribute('value', 'cancel');

    saveButton.style.marginLeft='10px';
    saveButton.style.marginRight='10px';

    saveButton.style.width='max-content';
    cancelButton.style.width='max-content';
    input.style.width='max-content';

    container.style.display = 'flex';
    container.appendChild(input);
    container.appendChild(saveButton);
    container.appendChild(cancelButton);
    container.style.zIndex = 20;
    saveButton.addEventListener('click', saveCurrentSelections, false);
    cancelButton.addEventListener('click', cancelAllSelections, false);
    return container;


}
function saveCurrentSelections() {
    var noteName = document.querySelector('input[name=notename]').value;
    if(noteName){
    obj.noteName=noteName;  
    
}
    else{
        alert("Enter Note Name");
    }
    notes.push(obj);
    localStorage.setItem('savedNotes', JSON.stringify(notes));
    const data= localStorage.getItem('savedNotes');
    console.log(JSON.parse(data));
    clearCurrentSelectionBoxes();

}
function cancelAllSelections() {
    clearCurrentSelectionBoxes();
}


// connecting background and content scripts
browser.runtime.onMessage.addListener((req, sender, res) => {



    if (req.action === 'hello') return res('hello world');
    return true;
})
