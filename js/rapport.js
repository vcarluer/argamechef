function load() {
    var div = document.getElementById('images');
    var data = getLastMissionCaptures();
    if (!data) {
        div.innerHTML = "Aucune mission effectuée";
        return;
    }
    
    for(var i = 0; i < data.length; i++) {
        var imageData = data[i].data;
        var image = new Image(data[i].width, data[i].height);
        image.src = imageData;
        div.appendChild(image);
    }
}

ready(load);