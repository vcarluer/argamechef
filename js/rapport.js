function load() {
    var div = document.getElementById('images');
    var data = getLastMissionCaptures();
    if (!data) {
        div.innerHTML = "Aucune mission effectuée";
        return;
    }
    
    for(var i = 0; i < data.length; i++) {
        var imageData = data[i];
        var image = new Image();
        image.src = imageData;
        div.appendChild(image);
    }
}

ready(load);