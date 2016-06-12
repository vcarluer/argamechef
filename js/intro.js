var jingle;
var concTO;

function load() {
    jingle = document.getElementById('jingle');
    
    jingle.addEventListener('ended', function() {
        clearTimeout(concTO);
       window.location.href = 'applications.html'; 
    });
}

function go() {
    jingle.play();
    var play = document.getElementById('play');
    play.className += " FadeOut";
    document.getElementById('title').className += " MoveLeft";;
    
    setTimeout(function() {
            document.getElementById('t1').className += " FadeIn";
            document.getElementById('t2').className += " FadeIn";
            document.getElementById('t3').className += " FadeIn";    
       }, 1000);
       
    
    concTO = setTimeout(function() {
            window.location.href = 'applications.html'; 
       }, 10000);
}

ready(load);