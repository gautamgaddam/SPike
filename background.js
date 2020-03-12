 
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
console.log("Spike Background Script Recieved");


browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.executeScript({code:"console.log('background script')"});
    // browser.tabs.executeScript(null,{file:"spike.client.js"});
});

