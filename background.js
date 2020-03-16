 
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
console.log("Spike Background Script Recieved");

browser.runtime.onMessage.addListener(function (request, sender) {
    chrome.extension.onConnect.addListener(function(port) {
        console.log("Connected .....");
        port.onMessage.addListener(function(msg) {
             console.log("message sent" + msg);
             port.postMessage(request);
        });
   })
});

browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.executeScript({code:"console.log('background script')"});
    // browser.tabs.executeScript(null,{file:"spike.client.js"});
});
// chrome.runtime.onInstalled.addListener(function() {
  
//     chrome.storage.local.set({ 'isPaused': 0 });
//     console.log("Spike Status created");
//   });

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     console.log(JSON.stringify(message));
//     chrome.storage.local.set({ 'highlights':JSON.stringify(message.highlights) });
// });