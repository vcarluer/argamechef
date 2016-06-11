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
        if (marker.id === 500) {
            resetMission();
        }
    
        if (marker.id === 200) {
            if (!result) {
                var dice = Math.floor(Math.random() * 3);
                if (dice < 1) {
                    var word = 'Perdu';
                    headerText = '-1 ' + word;
                    result = 'failure';
                } else {
                    var word = 'Confiant';
                    headerText = '+' + dice.toString() + ' ' + word;
                    result = 'success';
                }
            }
        }
    }
}

function draw() {
    drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    if (result && video2.readyState === video2.HAVE_ENOUGH_DATA) {
        context2.drawImage(video2, 0, 0, camera.width, camera.height);
        imageData2 = context2.getImageData(0, 0, camera.width, camera.height);
        detector2.detect(imageData2);
        
        context2.clearRect(0, 0, camera.width, camera.height);    
        
        if (result === 'success') {
            drawSuccess(detector2, context2);    
        } else {
            drawFailure(detector2, context2);
        }
        
        if (headerText) {
            context2.font = (canvas2.width / headerText.length).toString() +  'pt Calibri';
            context2.lineWidth = 2;
            if (result === 'success') {
                context2.strokeStyle = "#009900";    
            } else {
                context2.strokeStyle = "#990000"
            }
            
            context2.strokeText(headerText, 25, 70);   
        }
        
        drawContext.drawImage(canvas2, 0, 0, drawCanvas.width, drawCanvas.height); 
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