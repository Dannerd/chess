/**
 * Created by Daniel on 23/06/2017.
 */
var c;
function setup(){
    c = new Chess(innerWidth);
    c.init();
    frameRate(120);
}



function draw(){
    c.show();
}


function windowResized(){
    c.resize(innerWidth);
}