
// Dependencies
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io')(server);
var path = require('path');
var hue = require("node-hue-api");
//Sockets
require('./routes/socket')(io);

//CORS
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/',express.static(path.join(__dirname, 'public')));


console.log("homeAuto server running!");
