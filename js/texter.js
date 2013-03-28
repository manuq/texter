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
  this.minFontSize = 8;
  this.maxFontSize = 300;
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
    canvas.addEventListener('mouseout',  mouseUp,  false);

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
        
        context.font = fontSize + "px Georgia";

        letter_to_context( letter, angle );

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
    var fontSize = _this.minFontSize + d/2;

    if ( fontSize > _this.maxFontSize ) {
      fontSize = _this.maxFontSize;
    }
    return fontSize;
  }

  var letter_to_context = function( letter, angle ) {
        context.save();
        context.translate( position.x, position.y);
        context.rotate( angle + ( Math.random() * ( _this.angleDistortion * 2 ) - _this.angleDistortion ) );
        context.fillText(letter,0,0);
        context.restore();
  }

  var mouseDown = function( event ){
    mouse.down = true;
    var rect = canvas.getBoundingClientRect();
    position.x = event.clientX - rect.left;
    position.y = event.clientY - rect.top;
  }

  var mouseUp = function( event ){
    mouse.down = false;
    if (_this.completeWords == false) {
	return;
    }

    // Finish word following the same angle
    var newDistance = distance( position, mouse );
    var fontSize = calcFontSize( newDistance );
    var letter = _this.text[textIndex];
    var angle = Math.atan2(mouse.y-position.y, mouse.x-position.x);
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    context.font = fontSize + "px Georgia";
    while(letter != ' ') {

        letter_to_context( letter, angle );

        textIndex++;
        if (textIndex > _this.text.length-1) {
          textIndex = 0;
          return;
        }
	else {
          var stepSize = textWidth( letter, fontSize );
          position.x = position.x + cos * stepSize;
          position.y = position.y + sin * stepSize;
          letter = _this.text[textIndex];
	}
    }
  }

  var textWidth = function( string, size ) {
    context.font = size + "px Georgia";
    
    if ( context.fillText ) {
      return context.measureText( string ).width;

    } else if ( context.mozDrawText) {
      return context.mozMeasureText( string );

    }
  };

  this.clear = function() {
    canvas.width = canvas.width;
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
