
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

window.onload = function () {
    
    console.log("onload" + Date());
    var toggleSpike = document.getElementById('switch');
    var count = 0;
    browser.storage.local.get('isPaused', function (data) {
        console.log(data.isPaused);
        if (data.isPaused === undefined) {
            toggleSpike.innerHTML = '<span>Turn On</span>';
            browser.storage.local.set({ 'isPaused': count });
        }
        else if (data.isPaused) {
            toggleSpike.innerHTML = '<span>Turn Off</span>';
        }
        else {
            toggleSpike.innerHTML = '<span>Turn On</span>';
        }
    });
   



    toggleSpike.addEventListener('click', handler);
    function handler() {


        browser.storage.local.get('isPaused', function (data) {
            console.log(data.isPaused);
            if (!data.isPaused) {
                toggleSpike.innerHTML = '<span>Turn Off</span>';
                count = 1;
            } else {
                toggleSpike.innerHTML = '<span>Turn On</span>';
                count = 0;
            }
            browser.storage.local.set({ isPaused: count });
            chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {message: count});
   });
        })
        
    }

};