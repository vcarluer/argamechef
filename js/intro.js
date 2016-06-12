function load() {
    var jingle = document.getElementById('jingle');
    jingle.addEventListener('canplay', function() {
       jingle.play();
       setTimeout(function() {
            document.getElementById('t1').className += " FadeIn";
            document.getElementById('t2').className += " FadeIn";
            document.getElementById('t3').className += " FadeIn";    
       }, 1000);
       
    });
    
    jingle.addEventListener('ended', function() {
       window.location.href = 'applications.html'; 
    });
}

ready(load);