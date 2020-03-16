
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
console.log("Spike content script started");







var spikeStatus;
browser.runtime.onMessage.addListener(function (request, sender) {
    spikeStatus = request.message;
    console.log(request.message);
});


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


document.addEventListener("selectionchange", handleSelectionChange, false);
var redrawTimer = null;
window.addEventListener("scroll", redrawSelectionBoxes, false);
window.addEventListener("resize", redrawSelectionBoxes, false);
function handleSelectionChange() {
    var selectionString = window.getSelection().toString();
    console.log(spikeStatus);
    if (selectionString && spikeStatus) {
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
    if (spikeStatus) {
        clearTimeout(redrawTimer);
        redrawTimer = setTimeout(drawSelectionBoxes, 100);
    }
    else {
        return;
    }
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


    if (!selection.toString().length > 0) {

        clearCurrentSelectionBoxes();
        return;
    } else {

        // Technically, a selection can have multiple ranges, as defined in the
        // "Selection.rangeCount" property; but, for the most part, we are only going
        // to deal with the first (and often only) selection range.
        var range = selection.getRangeAt(0);
        var rect = range.getBoundingClientRect();

        // Check to make sure the selection dimensions aren't zero.
        if (rect.width && rect.height) {

            var outline = document.createElement("div");

            outline.classList.add("bounding-rect");
            outline.style.top = (rect.top + "px");
            outline.style.left = (rect.left + "px");
            outline.style.width = (rect.width + "px");
            outline.style.height = (rect.height + "px");
            outline.style.position = "fixed";
            outline.style.zIndex = 20;


            outline.appendChild(createDiv());
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


function createDiv() {
    var container = document.createElement('div');
    container.classList.add('text-fields');
    var saveButton = document.createElement('input');
    var cancelButton = document.createElement('input');
    saveButton.setAttribute('type', 'button');
    saveButton.setAttribute('value', 'Add');
    cancelButton.setAttribute('type', 'button');
    cancelButton.setAttribute('value', 'cancel');
    saveButton.style.marginLeft = '10px';
    saveButton.style.marginRight = '10px';

    saveButton.style.width = 'max-content';
    cancelButton.style.width = 'max-content';
    container.style.display = 'flex';

    container.appendChild(saveButton);
    container.appendChild(cancelButton);
    container.style.zIndex = 20;
    saveButton.addEventListener('click', saveCurrentSelections, false);
    cancelButton.addEventListener('click', cancelAllSelections, false);
    return container;


}
function saveCurrentSelections() {

    // chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    //         console.log(message);

    //         sendResponse(response);
    // });
    const highlights = addHighlight();
    console.log(highlights);
    chrome.runtime.sendMessage(highlights);

    chrome.storage.local.set({ highlights: highlights });
    clearCurrentSelectionBoxes();
}
function cancelAllSelections() {
    clearCurrentSelectionBoxes();
}
var notes = [];
function addHighlight() {
    var id = null;
    var className = null;
    var obj = {};
    var range = window.getSelection().getRangeAt(0);
    className = _stringUtils.createUUID({ beginWithLetter: true });
    id = _stringUtils.createUUID({ beginWithLetter: true });
    var newRange = _xpath.createXPathRangeFromRange(range);
    createHighlight(newRange, id, className);
    obj.range = newRange;
    obj.id = id;
    obj.selection= window.getSelection().toString().trim();
    obj.className = className;
    notes.push(obj);


    return notes;
}










var _contentScript = {
    highlightClassName: "apply-bg"
};


function createHighlight(xpathRange, id, className) {
    "use strict";
    var range;

    // this is likely to cause exception when the underlying DOM has changed
    try {
        range = _xpath.createRangeFromXPathRange(xpathRange);
    } catch (err) {
        console.log("Exception parsing xpath range: " + err.message);
        return null;

    }

    if (!range) {
        console.log("error parsing xpathRange: " + xpathRange);
        return null;
    }
    return create(range, id, [
        _contentScript.highlightClassName,
        className
    ]);
}







//create span and wrap

function create(range, id, className) {
    "use strict";

    // highlights are wrapped in one or more spans
    var span = document.createElement("SPAN");
    span.style.background = 'gray';
    span.className = (className instanceof Array ? className.join(" ") : className);

    // each node has a .nextElement property, for following the linked list
    var record = {
        firstSpan: null,
        lastSpan: null
    };

    _doCreate(range, record, function () {
        // wrapper creator
        var newSpan = span.cloneNode(false);

        // link up
        if (!record.firstSpan) {
            record.firstSpan = newSpan;

            // only give the first span the id
            record.firstSpan.id = id;
        }

        if (record.lastSpan) {
            record.lastSpan.nextSpan = newSpan;
        }

        record.lastSpan = newSpan;

        // every span in the highlight has a reference to the first span
        newSpan.firstSpan = record.firstSpan;
        return newSpan;
    });

    // every span in the list must have a 'nextSpan' property, even if null.
    // Being an SPAN element, with this property defined, is a check for validity
    //        if (record.lastSpan) {
    //            record.lastSpan.nextSpan = null;
    //        }

    // terminate
    //        if (record.firstSpan) {
    //            record.lastSpan.nextElement = record; //connect linked list back to record
    //        }

    return record.firstSpan;
}


function _doCreate(range, record, createWrapper) {
    "use strict";
    //(startContainer == endContainer && startOffset == endOffset)
    if (range.collapsed) {
        return;
    }

    var startSide = range.startContainer, endSide = range.endContainer,
        ancestor = range.commonAncestorContainer, dirIsLeaf = true;

    if (range.endOffset === 0) {  //nodeValue = text | element
        while (!endSide.previousSibling && endSide.parentNode !== ancestor) {
            endSide = endSide.parentNode;
        }

        endSide = endSide.previousSibling;
    } else if (endSide.nodeType === Node.TEXT_NODE) {
        if (range.endOffset < endSide.nodeValue.length) {
            endSide.splitText(range.endOffset);
        }
    } else if (range.endOffset > 0) {  //nodeValue = element
        endSide = endSide.childNodes.item(range.endOffset - 1);
    }

    if (startSide.nodeType === Node.TEXT_NODE) {
        if (range.startOffset === startSide.nodeValue.length) {
            dirIsLeaf = false;
        } else if (range.startOffset > 0) {
            startSide = startSide.splitText(range.startOffset);

            if (endSide === startSide.previousSibling) {
                endSide = startSide;
            }
        }
    } else if (range.startOffset < startSide.childNodes.length) {
        startSide = startSide.childNodes.item(range.startOffset);
    } else {
        dirIsLeaf = false;
    }

    range.setStart(range.startContainer, 0);
    range.setEnd(range.startContainer, 0);

    var done = false, node = startSide;

    do {
        if (dirIsLeaf && node.nodeType === Node.TEXT_NODE &&
            !(node.parentNode instanceof HTMLTableElement) &&
            !(node.parentNode instanceof HTMLTableRowElement) &&
            !(node.parentNode instanceof HTMLTableColElement) &&
            !(node.parentNode instanceof HTMLTableSectionElement)) {
            //
            var wrap = node.previousSibling;

            if (!wrap || wrap !== record.lastSpan) {
                wrap = createWrapper(node);
                node.parentNode.insertBefore(wrap, node);
            }

            wrap.appendChild(node);

            // remove transparent style to fade to colour desired by class
            //                window.setTimeout(function(elem) {
            //                    elem.style.removeProperty("background-color");
            //                    elem.style.removeProperty("color");
            //                    elem.style.removeProperty("-webkit-box-shadow");
            //                }, 0, wrap);

            node = wrap.lastChild;
            dirIsLeaf = false;
        }

        if (node === endSide && (!endSide.hasChildNodes() || !dirIsLeaf)) {
            done = true;
        }

        if (node instanceof HTMLScriptElement ||
            node instanceof HTMLStyleElement ||
            node instanceof HTMLSelectElement) {
            //never parse their children
            dirIsLeaf = false;
        }

        if (dirIsLeaf && node.hasChildNodes()) {
            node = node.firstChild;
        } else if (node.nextSibling !== null) {
            node = node.nextSibling;
            dirIsLeaf = true;
        } else if (node.nextSibling === null) {
            node = node.parentNode;
            dirIsLeaf = false;
        }
    } while (!done);
}


