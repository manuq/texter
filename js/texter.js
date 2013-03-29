/*
 *  Texter - Drawing with Text.
 *  - Ported from demo in Generative Design book - http://www.generative-gestaltung.de
 *  - generative-gestalung.de original licence: http://www.apache.org/licenses/LICENSE-2.0
 *
 *  - Modified and maintained by Tim Holman - tholman.com - @twholman
 */

var defaultText = 'Texter ';

function Texter() {

  var _this = this;

  // Application variables
  position = {x: 0, y: window.innerHeight/2};
  textIndex = 0;
  this.textColor = "#000000";
  this.bgColor = "#ffffff";
  this.curFontSize = 16;
  this.varFontSize = 0.4;
  this.angle = 0;
  this.angleDelta = 0;
  this.angleDistortion = 0.01;
  this.completeWords = true;

  this.text = "There was a table set out under a tree in front of the house, and the March Hare and the Hatter were having tea at it: a Dormouse was sitting between them, fast asleep, and the other two were using it as a cushion, resting their elbows on it, and talking over its head. 'Very uncomfortable for the Dormouse,' thought Alice; 'only, as it's asleep, I suppose it doesn't mind.'";

  // Drawing Variables
  canvas = null;
  context = null;
  mouse = {x: 0, y: 0, down: false};

  bgCanvas = null;
  bgContext = null;

  this.initialize = function() {
    
    canvas = document.getElementById( 'canvas' );
    context = canvas.getContext( '2d' );
    canvas.width = 800;
    canvas.height = 600;
    
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup',   mouseUp,   false);
    canvas.addEventListener('mouseout',  mouseOut,  false);

    bgCanvas = document.createElement( 'canvas' );
    bgContext = bgCanvas.getContext( '2d' );
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    _this.setBackground( _this.bgColor );

    update();
  };

  var mouseMove = function( event ) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    draw();
  };

  var update = function() {
    requestAnimationFrame( update );
    draw();
  }

  var draw = function() { 
    if ( mouse.down ) {
      var newDistance = distance( position, mouse );
      var fontSize = calcFontSize( newDistance );
      var letter = _this.text[textIndex];
      var stepSize = textWidth( letter, fontSize );
      
      if (newDistance > stepSize) {
        var angle = Math.atan2(mouse.y-position.y, mouse.x-position.x);
	_this.angleDelta = _this.angle - angle;
       if (_this.angleDelta > 3.14) {
         _this.angleDelta = _this.angle + angle;
       }
	_this.angle = angle;
        
        context.font = fontSize + "px Gabriela";

        letter_to_context( letter );

        textIndex++;
        if (textIndex > _this.text.length-1) {
          textIndex = 0;
        }
      
        position.x = position.x + Math.cos(angle) * stepSize;
        position.y = position.y + Math.sin(angle) * stepSize;

      }
    }
  };

  var distance = function( pt, pt2 ){
    var xs = 0;
    var ys = 0;
   
    xs = pt2.x - pt.x;
    xs = xs * xs;
   
    ys = pt2.y - pt.y;
    ys = ys * ys;
   
    return Math.sqrt( xs + ys );
  };

  var calcFontSize = function( d ) {
    var fontSize = _this.curFontSize + d * _this.varFontSize;
    return fontSize;
  }

  var letter_to_context = function( letter ) {
        context.save();
        context.translate( position.x, position.y);
        context.rotate( _this.angle + ( Math.random() * ( _this.angleDistortion * 2 ) - _this.angleDistortion ) );
        context.fillText(letter,0,0);
        context.restore();
  }

  var mouseDown = function( event ){
    mouse.down = true;
    var rect = canvas.getBoundingClientRect();
    position.x = event.clientX - rect.left;
    position.y = event.clientY - rect.top;
  }

  var mouseOut = function( event ){
    mouse.down = false;
  }

  var mouseUp = function( event ){
    if (mouse.down == false) {
	return;
    }
    mouse.down = false;
    if (_this.completeWords == false) {
	return;
    }

    // Finish word following the same angle
    var newDistance = distance( position, mouse );
    var fontSize = calcFontSize( newDistance );
    var letter = _this.text[textIndex];
    context.font = fontSize + "px Gabriela";
    while(letter != ' ') {

        letter_to_context( letter );

        textIndex++;
        if (textIndex > _this.text.length-1) {
          textIndex = 0;
          return;
        }
        else {
          var stepSize = textWidth( letter, fontSize );
          position.x = position.x + Math.cos(_this.angle) * stepSize;
          position.y = position.y + Math.sin(_this.angle) * stepSize;
          letter = _this.text[textIndex];
          _this.angle -= _this.angleDelta;
          _this.angleDelta -= _this.angleDelta / 6;
        }
    }
  }

  var textWidth = function( string, size ) {
    context.font = size + "px Gabriela";
    
    if ( context.fillText ) {
      return context.measureText( string ).width;

    } else if ( context.mozDrawText) {
      return context.mozMeasureText( string );

    }
  };

  this.clear = function() {
    canvas.width = canvas.width;
    textIndex = 0;
    context.fillStyle = _this.textColor;
  }

  this.applyNewColor = function( value ) {
    _this.textColor = value;
    context.fillStyle = _this.textColor;
  }

  this.setBackground = function( value ) {
    _this.bgColor = value;
    canvas.style.backgroundColor = value;

  };

  this.setText = function(text) {
    if (text == '') {
      text = defaultText;
    }
    this.text = text;
    textIndex = 0;
  }

  this.save = function() {

    // Prepare the background canvas's color
    bgContext.rect( 0, 0, bgCanvas.width, bgCanvas.height );
    bgContext.fillStyle = _this.bgColor;
    bgContext.fill();

    // Draw the front canvas onto the bg canvas
    bgContext.drawImage( canvas, 0, 0 );

    // Open in a new window
    window.open( bgCanvas.toDataURL('image/png'), 'mywindow' );

  }

};
