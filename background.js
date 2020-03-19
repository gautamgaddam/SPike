
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
console.log("Spike Background Script Recieved");




// Set storage properties
chrome.storage.sync.set({ displayHighlights: null }, function (data) {
    if (chrome.runtime.lastError) {
        console.error(
            "Error setting " + displayHighlights + " to " + JSON.stringify(data) +
            ": " + chrome.runtime.lastError.message
        );
    }
});






browser.runtime.onConnect.addListener(function (port) {
    console.log(JSON.stringify(port.name));
    switch (port.name) {
        case "checkUser":
            port.onMessage.addListener(function (msg) {
                chrome.storage.sync.get("userData", function (data) {
                    console.log(data.userData);
                })
            })
            break;
        case "authenTicateUser":
            port.onMessage.addListener(function (msg) {
                chrome.storage.sync.set({ userData: msg.userData }, function () { // Default to empty array
                    if (chrome.runtime.lastError) {
                        console.error(addN.stringify(data) +
                            ": " + chrome.runtime.lastError.message
                        );
                    }
                });
            });
            break;

        case "logoutUser":
            port.onMessage.addListener(function (msg) {
                chrome.storage.sync.set({ userData: msg.userData }, function () {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Error setting " + userData + " to " + JSON.stringify(data) +
                            ": " + chrome.runtime.lastError.message
                        );
                    }
                });
                chrome.storage.sync.get("userData", function (data) {
                    console.log(data.userData);
                });
            })
        case "pushHighlight":
            port.onMessage.addListener(function (msg) {

                chrome.storage.sync.get("displayHighlights", function (data) {
                    if (data.displayHighlights === null) {
                        chrome.storage.sync.set({ displayHighlights: msg.displayHighlights }, function () {
                            if (chrome.runtime.lastError) {
                                console.error(
                                    "Error setting " + displayHighlights + " to " + JSON.stringify(data) +
                                    ": " + chrome.runtime.lastError.message
                                );
                            }
                        });
                    }
                    else if (data.displayHighlights.length >= 1) {
                        Array.prototype.push.apply(data.displayHighlights, msg.displayHighlights);
                        console.log(data.displayHighlights);
                        chrome.storage.sync.set({ displayHighlights: data.displayHighlights }, function () {
                            if (chrome.runtime.lastError) {
                                console.error(
                                    "Error setting " + displayHighlights + " to " + JSON.stringify(data) +
                                    ": " + chrome.runtime.lastError.message
                                );
                            }
                        });
                    }
                });


            });
            break
        default:
            break;
    }


});



browser.browserAction.onClicked.addListener(function (tab) {
    console.log("clicked popup");
    browser.tabs.executeScript({ code: "console.log('background script')" });
    // browser.tabs.executeScript(null,{file:"spike.client.js"});
});
