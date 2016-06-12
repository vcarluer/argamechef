/*
global navigator
global MediaStreamTrack
global video1
global video2
global ready
*/

var camera, canvas, context, imageData, detector;
var canvas2, context2, imageData2, detector2;
var debugImage;
var drawCanvas, drawContext, resetCanvas;
var result;
var headerText, texts;
var intricationWords = ['Ronronnement','Assourdissant','Sifflement','Crie','Perdu','Bois','Miroir','Eau','Feu','Circulation','Gratte-ciel','Lac','Mer','Montagne','Neige','Verdoyant','Palmier','Glissade','Vélo','Marais','Animal','Tambours','Masques','Costumes','Gare','Horloge','Église','Cimetière','Enfants','Parapluie','Arme','Outils','Drapeau','Parking','Bar','Restaurant','Pétards','Défilé','Attaché','Allongé','Assis','Roulement','Balancer','Saut','Sonné','Murmure','Moteur','Musique','Course','Inquiétude','Poursuite','Peur','Recherche','Conversations','Réception','Cuisine','Souffle','Puanteur','Parfum','Nourriture','Fleurs','Claquement','Vent','Pluie','Tonnerre','Chaleur','Froid','Fatigue','Adrénaline','Douleur','Humidité','Sécheresse','Perdu','Regard','Tombé','Séparé','Sport','Télévision','Radio','Élégant','Nu','Couple','Amis','Alcool','Transport','Coups','Chant','Yeux','Ravin','Explosion','Sécurité','Uniforme','Rires','Jeux','Pleurs','Micro'];
var winWords = ['Précis','Solidaire','Honnête','Calme','Confiant','Courageux','Inspiré','Concentré','Puissant','Inventif','Surprenant','Vif','Ingénieux'];
var loseWords = ['Affolé','Apeuré','Choqué','Découragé','Désarmé','Énervé','Fatigué','Impatient','Surpris','Perdu','Isolé'];
var captured;
var startMark;

function load() {
    camera = document.getElementById("video2");
      
    drawCanvas = document.getElementById("drawCanvas");
    drawContext = drawCanvas.getContext("2d");
    
    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    
    canvas2 = document.createElement("canvas");
    context2 = canvas2.getContext("2d");
    
    canvas2.width = canvas.width = camera.width = 320;
    canvas2.height = canvas.height = camera.height = 240;
    
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight - 100;
    
    headerText = '';
    texts = [];
    
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (navigator.getUserMedia){
        init();
    }
}

function init() {
    // Get last stream
    MediaStreamTrack.getSources(function(sourceInfos) {
      var audioSource = null;
      var videoSource = null;
    
      for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audio') {
          console.log(sourceInfo.id, sourceInfo.label || 'microphone');
    
          audioSource = sourceInfo.id;
        } else if (sourceInfo.kind === 'video') {
          console.log(sourceInfo.id, sourceInfo.label || 'camera');
    
          videoSource = sourceInfo.id;
        } else {
          console.log('Some other kind of source: ', sourceInfo);
        }
      }
    
      sourceSelected(audioSource, videoSource);
    });
        
    // Get first stream
    navigator.getUserMedia({video:true}, successCallback2, errorCallback);
    
    imageData = context.getImageData(0, 0, camera.width, camera.height);
    imageData2 = context.getImageData(0, 0, camera.width, camera.height);
    detector = new AR.Detector();
    detector2 = new AR.Detector();
    
    debugImage = context.createImageData(camera.width, camera.height);
    
    window.addEventListener('orientationchange', updateOrientation, false);
    
    requestAnimationFrame(tick);
}


function updateOrientation() {
    resetCanvas = true;
}

function sourceSelected(audioSource, videoSource) {
  var constraints = {
    /*audio: {
      optional: [{sourceId: audioSource}]
    },*/
    video: {
      optional: [{sourceId: videoSource}]
    }
  };

  navigator.getUserMedia(constraints, successCallback, errorCallback);
}

function successCallback(stream){
  if (window.webkitURL) {
    video1.src = window.webkitURL.createObjectURL(stream);
  } else if (video1.mozSrcObject !== undefined) {
    video1.mozSrcObject = stream;
  } else {
    video1.src = stream;
  }
}
        
function errorCallback(error){
    console.log(error);
}
        
function successCallback2(stream){
  if (window.webkitURL) {
    video2.src = window.webkitURL.createObjectURL(stream);
  } else if (video2.mozSrcObject !== undefined) {
    video2.mozSrcObject = stream;
  } else {
    video2.src = stream;
  }
}

function tick(){
    requestAnimationFrame(tick);
    
    if (video1.readyState === video1.HAVE_ENOUGH_DATA){
        if (!result) {
            snapshot();
            detectMarkers();    
        }
            
        draw();
    }
    
    if (resetCanvas) {
        drawCanvas.width = window.innerWidth;
        drawCanvas.height = window.innerHeight - 100;
    }
}

function detectMarkers() {
    var markers = detector.detect(imageData);
    if (markers && markers.length > 0) {
        var marker = markers[0];
        texts = [];
        headerText = '';
        if (marker.id === 500) {
            resetMission();
            window.location.href = 'Rapport.html';
        }
    
        if (marker.id === 42) {
            if (!result) {
                var dice = Math.floor(Math.random() * 3);
                if (dice < 1) {
                    var word = pickInList(loseWords, 1)[0];
                    headerText = '-1 ' + word;
                    result = 'failure';
                } else {
                    var word = pickInList(winWords, 1)[0];
                    headerText = '+' + dice.toString() + ' ' + word;
                    result = 'success';
                }
            }
        }
        
        if (marker.id === 200) {
            result = 'success';
            headerText = 'Intrication en cours';
            texts = pickInList(intricationWords, 5);
        }
        
        if (marker.id === 300) {
            result = 'success';
            headerText = 'Réussite !';
        }
        
        if (marker.id === 310) {
            result = 'failure';
            headerText = 'Echec !';
        }
        
        startMark = Date.now();
    }
}

function draw() {
    drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    if (result && video2.readyState === video2.HAVE_ENOUGH_DATA) {
        context2.drawImage(video2, 0, 0, camera.width, camera.height);
        imageData2 = context2.getImageData(0, 0, camera.width, camera.height);
        detector2.detect(imageData2);
        
        context2.clearRect(0, 0, camera.width, camera.height);    
        
        var elapsed = Date.now() - startMark;
        
        if (result === 'success') {
            drawSuccess(detector2, context2);    
        } else {
            drawFailure(detector2, context2);
        }
        
        if (headerText) {
            var fontSize = canvas2.width / headerText.length;
            if (fontSize > 25) {
                fontSize = 25;
            }
            
            context2.font = (fontSize).toString() +  'pt Calibri';
            context2.lineWidth = 2;
            
            var alpha = elapsed / 3000;
            if (alpha > 1) {
                alpha = 1;
            }
            
            if (result === 'success') {
                context2.strokeStyle = "#009900";    
            } else {
                context2.strokeStyle = "#990000"
            }
            
            context2.globalAlpha = alpha;
            context2.strokeText(headerText, 25, 35);   
            context2.globalAlpha = 1;
            
            if (texts && texts.length > 0) {
                var currentIndex = (Math.floor(elapsed / 2000)) % 5;
                var step = elapsed % 2000;
                var alpha = 0;
                if (step < 1000) {
                    alpha = step / 1000;
                } else {
                    step = step - 1000;
                    alpha = 1 - (step / 1000);
                }
                
                /*var word = texts[currentIndex];
                context2.font = '16pt Calibri';
                
                context2.strokeText(word, 50 + currentIndex * 5, 50 + currentIndex * 25 + 15);   
                */
                
                for(var i = 0; i < texts.length; i++) {
                    var distance = Math.abs(currentIndex - i);
                    var alphaIdx = Math.max((alpha - distance / 3), 0);
                    context2.globalAlpha = alphaIdx;    
                    
                    var word = texts[i];
                    context2.font = '16pt Calibri';
                    context2.strokeText(word, 50 + i * 5, 50 + i * 25 + 15);   
                    context2.globalAlpha = 1;
                }
            }
        }
        
        drawContext.drawImage(canvas2, 0, 0, drawCanvas.width, drawCanvas.height);
        if (!captured & elapsed > 2000) {
            captured = true;
            capture(canvas2);
        }
    } else {
        drawContext.drawImage(canvas, 0, 0, drawCanvas.width, drawCanvas.height);
    }
}

function snapshot(){
  context.drawImage(video1, 0, 0, camera.width, camera.height);
  imageData = context.getImageData(0, 0, camera.width, camera.height);
}

function drawSuccess(detect, cont) {
      var width = camera.width, height = camera.height;
      drawContours(detect.contours, 0, 0, width, height, function(hole) {return hole? "magenta": "blue";}, cont);
}

function drawFailure(detect, cont) {
      cont.putImageData( createImage(detect.thres, debugImage), 0, 0);
}

function drawContours(contours, x, y, width, height, fn, cont){
  var i = contours.length, j, contour, point;
  
  while(i --){
    contour = contours[i];

    cont.strokeStyle = fn(contour.hole);
    cont.beginPath();

    for (j = 0; j < contour.length; ++ j){
      point = contour[j];
      cont.moveTo(x + point.x, y + point.y);
      point = contour[(j + 1) % contour.length];
      cont.lineTo(x + point.x, y + point.y);
    }
    
    cont.stroke();
    cont.closePath();
  }
}

function createImage(src, dst){
  var i = src.data.length, j = (i * 4) + 3;
  
  while(i --){
    dst.data[j -= 4] = 255;
    dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
  }
  
  return dst;
}

ready(load);