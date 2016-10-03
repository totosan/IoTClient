// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
var EventHubClient = require('azure-event-hubs').Client;
var CO2_lib = require('jsupm_mhz16');
var Promise = require('bluebird');
var Moment = require('moment');
var outputStr = "";
var myInterval = null;

var sendInterval = 2000;

// Instantiate a MHZ16 serial CO2 sensor on uart 0.
// This example was tested on the Grove CO2 sensor module.
var myCO2_obj = new CO2_lib.MHZ16(0);

// The Event Hubs SDK can also be used with an Azure IoT Hub connection string.
// In that case, the eventHubPath variable is not used and can be left undefined.
var connectionString = 'Endpoint=sb://iotshowcasettneur.servicebus.windows.net/;SharedAccessKeyName=readwrite;SharedAccessKey=dm9ZuB09CJe/WpSfPTYuWMrZR78ZF9Pisdr1lgcKO3c=';
var eventHubPath = 'co2stream';

var clientEV = EventHubClient.fromConnectionString(connectionString, eventHubPath)

var print = function (text) {
	//console.log(text);
}

// Print message, clear memory when exiting
process.on('SIGINT', function () {
	clearInterval(myInterval);
	Cylon.cleanUp();
	myCO2_obj = null;
	CO2_lib.cleanUp();
	CO2_lib = null;
	print("Exiting");
	process.exit(0);
});

var senderFunction = function (sender, content) {
	print('Sending device event data:\n' + content);
	sender.send(content);
}

clientEV.createSender()
    .then(function (tx) {
	tx.on('errorReceived', function (err) { print(err); });
	
	// make sure port is initialized properly.  9600 baud is the default.
	if (!myCO2_obj.setupTty(CO2_lib.int_B9600)) {
		print("Failed to setup tty port parameters");
		process.exit(0);
	}
	
	setTimeout(function () {
		myInterval = setInterval(function () {
			if (!myCO2_obj.getData())
				print("Failed to retrieve data");
			else {
				outputStr = "CO2 concentration: " + myCO2_obj.getGas() + " PPM, " + "Temperature (in C): " + myCO2_obj.getTemperature();
				print(outputStr);
				// Create a message and send it to IoT Hub.
				var data = JSON.stringify( {
					'DeviceID': 'Nenzingen, Traubenweg 11', 
					'Temperature': myCO2_obj.getTemperature() + '.0', 
					'CO2': myCO2_obj.getGas() + '.0', 
					'ExternalTemperature': myCO2_obj.getTemperature()-4 + '.0',
					'maxCO2' : '2000.0',
					'minCO2' : '500.0',
					'minTemp': '20.0',
					'maxTemp': '30.0',
					'time': Moment().utc().format()
				});
				
				senderFunction(tx, data);

			}
		}, sendInterval);
	}, 1000);

});