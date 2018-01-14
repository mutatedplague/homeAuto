//Dependencies
var moment = require('moment');
var Bulb = require('tplink-lightbulb');
var philipsHue = require("node-hue-api");
var HueApi = require("node-hue-api").HueApi;


var lightsArr = {
    tpLink: [],
    hue: []
};
var allLights = true;
var bridgeIp = "";
var hueUserName = "";
// var brightness = 100;

//light types 
// 0 - TPLINK
// 1 - HUE


module.exports = function(io) {

    io.on('connection', function(socket) {

        console.log('Getting Lights');


        function discoverBridges() {

            console.log("Getting Bridges");
            var displayBridges = function(bridges) {
            //bridgeIp = bridge[0].ipaddress;
            //createLogin();
            io.emit('discoveredBridges', bridges);
            };


            philipsHue.nupnpSearch().then(displayBridges).done();

        }


        socket.on('discoverBridges', function(dimTo) {
            discoverBridges();
        });

        function connectBridge(ipaddress, index) {
            
            //create a login an responsd successful connection
            bridgeIp = ipaddress;
            var displayUserResult = function(result) {
                
                hueUserName = result;
                console.log("Created user: " + JSON.stringify(result));
                io.emit('bridgeConnected', ipaddress, index);
                getLights();

            };

            var displayError = function(err) {
            console.log(err);
            };

            var hue = new HueApi();


            hue.registerUser(ipaddress, 'homeAuto Dashboard')
            .then(displayUserResult)
            .fail(displayError)
            .done();

        }

        socket.on('connectBridge', function(ipaddress, index) {
            connectBridge(ipaddress, index);
        });



 
        function toggleHueLight(id, toggle) {
            var displayResult = function(result) {
                //console.log(result);
            };

            var displayError = function(err) {
                console.error(err);
            };


            api = new HueApi(bridgeIp, hueUserName);
            api.setLightState(id, {
                "on": toggle,
            }) // provide a value of false to turn off
            .then(displayResult)
            .fail(displayError)
            .done();
        }

        function toggleHueBrightness(id, brightness) {
            var displayResult = function(result) {
                //console.log(result);
            };

            var displayError = function(err) {
                console.error(err);
            };


            api = new HueApi(bridgeIp, hueUserName);
            api.setLightState(id, {
                "bri": brightness,
            }) // provide a value of false to turn off
            .then(displayResult)
            .fail(displayError)
            .done();
        }


        function getLights() {

    
            lightsArr['tpLink'] = [];
            lightsArr['hue'] = [];

            //tpLink lights
            Bulb.scan()
            .on('light', light => {
                //console.log(light);
                lightsArr['tpLink'].push(light);
                io.emit('lights', lightsArr);
                io.emit('toggleAllLights', allLights);
            })

            //Hue lights 
            if (hueUserName) {

                var displayResult = function(result) {
                    lightsArr['hue'].push(result);
                    io.emit('lights', lightsArr);
                    io.emit('toggleAllLights', allLights);
                };

                new HueApi(bridgeIp, hueUserName).lights()
                .then(displayResult)
                .done();


            }
           

        }

        getLights();




        socket.on('light', function(type, index, toggle) {
            if (!type) {
                var address = lightsArr['tpLink'][index].ip;
                lightsArr['tpLink'][index]._sysinfo.light_state.on_off = toggle;
                const light = new Bulb(address);
                light.send({
                    'smartlife.iot.smartbulb.lightingservice': {
                        'transition_light_state': {
                            'on_off': lightsArr['tpLink'][index]._sysinfo.light_state.on_off,
                            'transition_period': 1000
                        }
                    }
                });
            } else {
                toggleHueLight(index, toggle);
            }
        });

        socket.on('brightness', function(type, index, brightness) {

            if (!type) {
                var address = lightsArr['tpLink'][index].ip;
                lightsArr['tpLink'][index]._sysinfo.light_state.brightness = brightness;
                const light = new Bulb(address);
                light.send({
                    'smartlife.iot.smartbulb.lightingservice': {
                        'transition_light_state': {
                            'brightness': lightsArr['tpLink'][index]._sysinfo.light_state.brightness,
                            'transition_period': 1000
                        }
                    }
                });
            } else {
                toggleHueBrightness(index, brightness);
            }


        });

        socket.on('dim', function(dimTo) {
            brightness = dimTo;
        });



        socket.on('allLights', function(data) {
            toggle = data;
        });

        socket.on('disconnect', function() {
            console.log('Got disconnect!');
        });



    });

};