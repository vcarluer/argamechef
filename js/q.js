/*global localStorage*/

var charaCount = 35;
var itemCount = 25;
var placeCount = 28;

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function pickMission() {
  var place = pick(placeCount);
  var item = pick(itemCount);
  
  var charaList = [];
  for (var i = 0; i < charaCount; i++) {
    charaList.push(i);
  }
  
  var chara1 = pickList(charaList);
  var chara2 = pickList(charaList);
  var chara3 = pickList(charaList);
  
  return {
    place: place,
    item: item,
    chara1: chara1,
    chara2: chara2,
    chara3: chara3
  };
}

function pick(max) {
  return Math.floor(Math.random() * max);
}

function pickInList(list, count) {
  var result = [], cloneList = list.slice(0), pickItem;
  
  for(var i = 0; i < count; i++) {
    pickItem = pickList(cloneList);
    result.push(pickItem);
  }
  
  return result;
}

function pickList(list) {
  var choiceIndex = Math.floor(Math.random() * list.length);
  var choice = list[choiceIndex];
  delete list[choiceIndex];
  return choice;
}

function readMission() {
  var json = localStorage.currentMission;
  if (!json) return null;
  return JSON.parse(json);
}

function writeMission(mission) {
  if (!mission) return;
  var json = JSON.stringify(mission);
  localStorage.currentMission = json;
}

function resetMission() {
  localStorage.removeItem('currentMission');
  localStorage.lastMissionNames = localStorage.captureNames.toString();
  // debug(localStorage.lastMissionNames);
  localStorage.removeItem('captureNames');
  switchPrefix();
}

function getMission() {
    var mission = readMission();
    if (!mission) {
        mission = pickMission();
        writeMission(mission);
    }
    
    return mission;
}

function capture(canvas) {
  if (!canvas) return;
  var names = getCaptureNames();
  var prefix = getCurrentPrefix();
  var newName = prefix + 'capture' + names.length.toString();
  names.push(newName);
  var data = canvas.toDataURL();
  localStorage[newName] = data;
  var json = JSON.stringify(names);
  localStorage.captureNames = json;
}

function debug(log) {
  var div = document.getElementById('debug');
  if (div) {
    div.innerHTML += log;
  }
}

function getCaptureNames() {
  var names, json = localStorage.captureNames;
  if (json) {
    // debug(json);
    names = JSON.parse(json);
  } else {
    names = [];
  }
  
  return names;
}

function getLastMissionCaptures() {
  var json = localStorage.lastMissionNames
  // debug(json);
  if (json) {
    var names = JSON.parse(json);
    var images = [];
    var prefix = getLastPrefix();
    for(var i = 0; i < names.length; i++) {
      var name = names[i];
      var data = localStorage[name];
      if (data) {
        images.push(data);
      }
    }
    
    return images;
  }
}

function getCurrentPrefix() {
  var prefix = localStorage.currentPrefix;
  if (!prefix) {
    prefix = 'a';
    localStorage.currentPrefix = prefix;
  }
  
  return prefix;
}

function getLastPrefix() {
  return localStorage.lastPrefix;
}

function switchPrefix() {
  var lastPrefix, prefix = getCurrentPrefix();
  if (prefix === 'a') {
    prefix = 'b';
    lastPrefix = 'a';
  } else {
    prefix = 'a';
    lastPrefix = 'b'
  }
  
  localStorage.currentPrefix = prefix;
  localStorage.lastPrefix = lastPrefix;
}