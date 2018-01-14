var app = angular.module("app", ['ui.router', 'cgNotify']);

app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/dash');
	$stateProvider

        .state("dash", {
          url:"/dash",
          controller: "dashController",
          templateUrl: "views/dash.html"
        })




}).factory('socket', function () {
  console.log("Connecting");
  return  io();
})
