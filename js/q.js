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
  localStorage.currentMission = null;
}

function getMission() {
    var mission = readMission();
    if (!mission) {
        mission = pickMission();
        writeMission(mission);
    }
    
    return mission;
}