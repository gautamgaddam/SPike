 
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
console.log("Spike Background Script Recieved");
// chrome.browserAction.onClicked.addListener(function(tab) {
//     chrome.tabs.sendRequest(tab.id, {method: "getSelection"}, function(response){
//        sendServiceRequest(response.data);
//     });
//   });
  
//   function sendServiceRequest(selectedText) {
//     var serviceCall = 'http://www.google.com/search?q=' + selectedText;
//     chrome.tabs.create({url: serviceCall});
//   }
document.getElementById('switch').addEventListener('click', hello);


function hello(){
    console.log("button clicked");
}
chrome.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.executeScript({code:"console.log('background script')"});
    browser.tabs.executeScript({file:"spike.client.js"});
});