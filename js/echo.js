/*
global navigator
global MediaStreamTrack
global THREE
global AR
global POS
global localStorage
*/

var video, canvas, context, imageData, detector, posit;
var renderer3;
var scene3, scene4;
var camera3, camera4;
var models, texture;
var step = 0.0;
var resetOrientation;
var container;
var lastDetect;

var modelSize = 50.0; //millimeters

function load() {
    container = document.getElementById("container");
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    
    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);
    
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (navigator.getUserMedia){
        init();
    }
}

function init() {
      initVideo();
      detector = new AR.Detector();
      posit = new POS.Posit(modelSize, canvas.width);

      createRenderers();
      createScenes();
      
      lastDetect = {};
      window.addEventListener('orientationchange', updateOrientation, false);

      requestAnimationFrame(tick);
}

function updateOrientation() {
    resetOrientation = true;
}

function initVideo() {
    navigator.mediaDevices.enumerateDevices().then(function(sourceInfos) {
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

  navigator.getUserMedia(constraints, sourceSuccessCallback, sourceErrorCallback);
}

function sourceSuccessCallback(stream){
  if (window.webkitURL) {
    video.src = window.webkitURL.createObjectURL(stream);
  } else if (video.mozSrcObject !== undefined) {
    video.mozSrcObject = stream;
  } else {
    video.src = stream;
  }
}

function sourceErrorCallback(error){
    console.log(error);
}
    

function tick(){
  requestAnimationFrame(tick);
  
  if (video.readyState === video.HAVE_ENOUGH_DATA){
    snapshot();
    
    if (resetOrientation) {
        renderer3.setSize(window.innerWidth, window.innerHeight - 100);
    }

    var markers = detector.detect(imageData);
    updateScenes(markers);
    
    render();
  }
}

function snapshot(){
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function createRenderers(){
  renderer3 = new THREE.WebGLRenderer();
  renderer3.setClearColor(0xffff00, 1);
  renderer3.setSize(window.innerWidth, window.innerHeight - 100);
  container.appendChild(renderer3.domElement);
  
  scene3 = new THREE.Scene();
  camera3 = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
  scene3.add(camera3);
  
  scene4 = new THREE.Scene();
  camera4 = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
  scene4.add(camera4);
}

function render(){
  renderer3.autoClear = false;
  renderer3.clear();
  renderer3.render(scene3, camera3);
  renderer3.render(scene4, camera4);
}

function createScenes(){
  texture = createTexture();
  scene3.add(texture);
  
  var mission = getMission();
  
  models ={};
  addModel('110', 'place/' + mission.place + '.jpg', 'cube');
  addModel('120', 'chara/' + mission.chara1 + '.jpg', 'sphere');
  addModel('130', 'chara/' + mission.chara2 + '.jpg', 'sphere');
  addModel('140', 'item/' + mission.item + '.jpg', 'torusKnot');
  addModel('400', 'chara/' + mission.chara3 + '.jpg', 'sphere');
  
}

function addModel(id, path, type) {
  var model = createModel(path, type);
  scene4.add(model);
  models[id] = model;
}

function createTexture(){
  var texture = new THREE.Texture(video),
      object = new THREE.Object3D(),
      geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0),
      material = new THREE.MeshBasicMaterial( {map: texture, depthTest: false, depthWrite: false} ),
      mesh = new THREE.Mesh(geometry, material);
  
  object.position.z = -1;
  
  object.add(mesh);
  
  return object;
}

function createModel(path, type){
  var loader = new THREE.CubeTextureLoader();
      var url = "textures/cube/" + path;
			var urls = [url, url, url, url, url, url];
			
      var textureCube = new THREE.CubeTextureLoader().load( urls );
      textureCube.mapping = THREE.CubeRefractionMapping;
  
  
  var object = new THREE.Object3D();
  var geometry;
  if (!type || type === 'sphere') {
    geometry = new THREE.SphereBufferGeometry(0.8, 8, 6, Math.PI);  
  }
  
  if (type === 'cube') {
    geometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
  }
  
  if (type === 'torusKnot') {
    geometry = new THREE.TorusKnotBufferGeometry( 0.4, 0.15, 100, 16 ); 
  }
  
  
  var color = '#ffffff';
  
  var material = new THREE.MeshBasicMaterial( { color: color, envMap: textureCube, refractionRatio: 0.95, opacity: 0.9, transparent: true } );
  
  var mesh = new THREE.Mesh(geometry, material);
  
  object.add(mesh);
  
  return object;
}

function updateScenes(markers){
  if (markers.length > 0){
    markers.forEach(function(marker) {
      if (marker.id === 500) {
        resetMission();
      }
      
      var model = models[marker.id];
      if (model) {
        lastDetect[marker.id] = Date.now();
        var corners, corner, pose, i;
        corners = marker.corners;
        
        for (i = 0; i < corners.length; ++ i){
          corner = corners[i];
          
          corner.x = corner.x - (canvas.width / 2);
          corner.y = (canvas.height / 2) - corner.y;
        }
        
        pose = posit.pose(corners);
        
        updateObject(model, pose.bestRotation, pose.bestTranslation);
        
        step += 0.025;
        
        model.rotation.z -= step;  
        model.rotation.y -= step;  
      }
    });
  }
  
  for(var markerId in lastDetect) {
      var last = lastDetect[markerId];
      if ((Date.now() - last) > 500) {
        var model = models[markerId];
        if (model) {
          model.position.x = -1000;
        }
        
        delete lastDetect[markerId]
      }
    }
  
  texture.children[0].material.map.needsUpdate = true;
}

function updateObject(object, rotation, translation){
 
  object.rotation.x = -Math.asin(-rotation[1][2]);
  object.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
  object.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);

  object.position.x = translation[0];
  object.position.y = translation[1];
  object.position.z = -translation[2];
  
  var scaleRatio= translation[2] /500;
  var scale = 1/(Math.pow(scaleRatio, 3));
  
   object.scale.x = scale;
  object.scale.y = scale;
  object.scale.z = scale;
  
}

ready(load);