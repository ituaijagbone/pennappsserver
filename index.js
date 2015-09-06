var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var slides = ["pin1.jpg", "pin2.jpg", "pin3.jpg", "pin4.jpg", "pin5.jpg"]
app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('sendList', function() {
    io.emit('sendList', {'slides': slides})
  });

  socket.on('changeIndex', function(data) {
    io.emit('changeIndex', {'slideIndex': data})
  });

  socket.on('changePresentation', function(data) {
    io.emit('sendList', {'slides': slides})
  });
  console.log('a user connected');
});

// use express return the list of presentations

http.listen(3000, function(){
  console.log('listening on *:3000');
});
