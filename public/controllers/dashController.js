app.controller("dashController", function ($scope, $http, notify){

   var socket = io();
   $scope.date = new Date();

   $scope.lightsArr = {
      tpLink: [],
      hue: []
   };

   $scope.bridgeArr = [];

   $scope.types = ["tpLink", "hue"];

   $scope.allLights;
   $scope.dimValue = 5;

  //Discover Bridge
  socket.on('discoveredBridges', function(data) {
      console.log("Bridges Found" + JSON.stringify(data));
      $scope.bridgeArr = data;
      $scope.$apply();
   });

   $scope.discoverBridges = function() {
    socket.emit('discoverBridges');
   }


  //Connect To Bridge
  socket.on('bridgeConnected', function(result, index) {
     $scope.bridgeArr[index].connected = true;
     console.log("Bridge " + result + " connected!");
     $scope.$apply();
  });

  $scope.connectBridge = function(ipaddress, index) {
     socket.emit('connectBridge', ipaddress, index);
  }

    socket.on('lights', function(data) {
     $scope.lightsArr = data;
     console.log(data);
     $scope.$apply();
   });



   socket.on('allLights', function(data) {
     $scope.allLights = data;
     $scope.$apply();
   });



   $scope.lightToggle = function(type, index, toggle) {
     if (!type) {
      $scope.lightsArr[$scope.types[type]][index]._sysinfo.light_state.on_off = toggle;
      socket.emit('light', type, index, toggle);

     } else {
      $scope.lightsArr[$scope.types[type]][0]['lights'][index].state.on = toggle;
      socket.emit('light', type, $scope.lightsArr[$scope.types[type]][0]['lights'][index].id, toggle);
     }

   }

   $scope.dim = function(brightness) {

      for (i = 0; i < $scope.lightsArr['tpLink'].length; i++) {
        socket.emit('brightness', 0, i, brightness);
      }
      for (i = 0; i < $scope.lightsArr['hue'][0]['lights'].length; i++) {
        socket.emit('brightness', 1, i, brightness);
      }

   }

    $scope.lightToggleAll = function() {
      $scope.allLights = !$scope.allLights;
      socket.emit('allLights', $scope.allLights);
      for (i = 0; i < $scope.lightsArr['tpLink'].length; i++) {
        $scope.lightToggle(0, i, $scope.allLights);
      }
      for (i = 0; i < $scope.lightsArr['hue'][0]['lights'].length; i++) {
        $scope.lightToggle(1, i, $scope.allLights);
      }



    }






  //socket.emit('updateCalendar', $scope.events);

})
