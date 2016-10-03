/**
 * LED
 */
class LED {
    constructor(parameters) {
  let groveSensor = require('jsupm_grove');
let led = new groveSensor.GroveLed(2);
      
// Turn the LED on and off 10 times, pausing one second
// between transitions
var i = 0;
var waiting = setInterval(function() {
        if ( i % 2 == 0 ) {
            led.on();
        } else {
            led.off();
        }
        i++;
        if ( i == 20 ) clearInterval(waiting);
        }, 1000);
    }
}
            

