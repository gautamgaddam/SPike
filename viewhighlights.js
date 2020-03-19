console.log("Start Authentication Check");


var port = chrome.runtime.connect({ name: "checkUser" });
port.postMessage({ user: "getUserdata" });

console.log("Viewhighlights page connected");





document.getElementById('userLogin').classList.add('dis-none');
var saveData = [];


chrome.tabs.query({
    active: true,               // Select active tabs
    lastFocusedWindow: true     // In the current window
}, function (array_of_Tabs) {
    // Since there can only be one active tab in one active window, 
    //  the array has only one element
    var tab = array_of_Tabs[0];
    // console.log(tab.url);
    // Example:
    var url = tab.url;



    //get from database 
    chrome.storage.sync.get("displayHighlights", function (data) {

        if (data.displayHighlights === null) {
            document.getElementById("loadHighlights").classList.add("dis-none");

        }
        else {
            let filterData = data.displayHighlights.filter((element) => {
                if (element.url === url) {
                    return element;
                }
            });
            if (filterData.length > 0) {
                document.getElementById('loadHighlights').classList.remove("dis-none");
                console.log(filterData);
                displayHighLights(filterData);
                saveData = filterData;

            } else {
                document.getElementById("loadHighlights").classList.add("dis-none");

            }
        }
    });
    chrome.storage.sync.get("userData", function (data) {
        if (data.userData) {
            let div = document.createElement('div');
            div.innerHTML = "User id:" + data.userData.userid;
            div.setAttribute("id", "userName");
            document.getElementById("userLogin").classList.add("dis-none");
            document.getElementById("notesDiv").classList.remove("dis-none");
            document.getElementById("goToSignIn").classList.add("dis-none");
            document.getElementById("showUser").appendChild(div);
            document.getElementById("logout").classList.remove("dis-none");
        } else {

        }
    })


});

var loadHighlights = document.getElementById('addNotes');
function displayHighLights(msg) {


    if (msg.length > 1) {
        msg.forEach(element => {
            if (!loadHighlights.contains(document.getElementById(element.id))) {
                insertNode(element);
            } else {
                return;
            }
        });
    } else {
        insertNode(msg[0])
    }


}

function insertNode(elm) {
    let div = document.createElement('li');
    let save = document.createElement('button');
    save.innerHTML = "save note";
    div.setAttribute('class', 'notes');
    div.innerHTML = elm.selection;
    div.setAttribute('id', elm.id);
    loadHighlights.prepend(div);

}




document.getElementById('saveAllNotes').addEventListener('click', saveAllNotes, false);
function saveAllNotes(e) {
    e.preventDefault();
    // Set storage properties
    chrome.storage.sync.get("userData", function (data) { // Default to empty array
        console.log(data.userData);
        console.log(saveData);
        if (data.userData) {
            var note = {
                userId: data.userData.userid,
                token: data.userData.access_token.token,
                noteRemark: document.getElementById('noteRemark').value,
                noteData: JSON.stringify(saveData),
                noteId: saveData[0].id,
                url: saveData[0].url,
            };


            httpCall("http://10.10.73.9:8012/api/createnotes", { ...note }).done(function (data) {
                // console.log(data);

                if (data) {
                    // console.log(data.message);
                    $("#addNotes").find("li").remove();
                    $("#loadHighlights").addClass("dis-none");

                    var port = chrome.runtime.connect({ name: "cleanNotes" });
                    port.postMessage({ user: saveData });

                }
            })
        } else {
            console.log("Please sign in");
        }
    });


}


function httpCall(url, postData = {}, asyncCall = true, headers = {}, type = "POST") {
    return $.ajax({
        type: type,
        url: url,
        headers: headers,
        async: asyncCall,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData)
    });
}