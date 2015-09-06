var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var multer  = require('multer');

var done=false;

var slides = ["pin1.jpg", "pin2.jpg", "pin3.jpg", "pin4.jpg", "pin5.jpg"];
var numberOfSlides = 1;

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/uploadfile', function(req, res){
  res.sendFile(__dirname + '/uploadfile.html');
});

app.post('/upload', function(req, res) {
  if(done==true){
    console.log(req.files);
    res.end("File uploaded.");
  }
});

app.get('/presentations', function(req, res, next) {
  var presentations = []
  for (i = 0; i < numberOfSlides; i++) {
    var presentation = {}
    presentation["title"] = "Testing Hack";
    presentation["thumbnail"] = "pin1.jpg";
    presentation["id"] = "1";
    presentations.push(presentation);
  }
  res.json({"results": presentations})
});

app.get('/slides', function(req, res, next) {
  var presentationId = parseInt(req["query"]["pid"]);
  var slidesR = []
  console.log(slides.length)
  for (i = 0; i < slides.length; i++) {
    var slide = {}
    slide["title"] = slides[i];
    slide["posterUrl"] = slides[i];
    slidesR.push(slide);
    console.log("here")
  }
  res.json({"results": slidesR})
});

io.on('connection', function(socket){
  socket.on('sendList', function() {
    io.emit('sendList', {'slides': slides})
  });

  socket.on('changeIndex', function(data) {
    io.emit('changeSlide', {'slideIndex': data})
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
