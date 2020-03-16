var port = chrome.extension.connect({
    name: "Sample Communication"
});
port.postMessage("Hi BackGround");
port.onMessage.addListener(function (msg) {
   
    let loadHighlights = document.getElementById('loadHighlights');
     console.log(msg)
     if(msg.length>1){
        // let loadClidren= loadHighlights
        msg.forEach(element => {
            if(!loadHighlights.contains(document.getElementById(element.id))){
                insertNode(element);
            }else{
                return;
            }
        });
     }else{
        insertNode(msg[0])
     }
        
      function insertNode(msg){
            let div= document.createElement('div');
            div.innerHTML= "<b>"+msg.selection+"</b>";
            div.style.border="1px solid grey";
            div.style.borderRadius='10px';
            div.setAttribute('id', msg.id);
            loadHighlights.append(div);
      }  
     


   
});



