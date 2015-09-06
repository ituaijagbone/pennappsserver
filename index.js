var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var multer  = require('multer');
var mongodb = require('mongodb');
var ObjectID = require('mongodb').ObjectID
var MongoClient = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/pennappsdb1';

var done=false;

var slides = ["pin1.jpg", "pin2.jpg", "pin3.jpg", "pin4.jpg", "pin5.jpg"];
var numberOfSlides = 1;

var tomongo = [];

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file)
  console.log(file.name + ' uploaded to  ' + file.path)
  tomongo.push({"name": file.name,
    "title": file.originalname, "posterUrl":file.path})
  done=true;
}
}));

app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/uploadfile', function(req, res){
  tomongo = [];
  res.sendFile(__dirname + '/uploadfile.html');
});

app.post('/upload', function(req, res) {
  if(done==true){
    console.log("here")
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('presentations');

        var presentationsdb = {name: req["body"]["presentationTitle"], thumbnail:tomongo[0]["posterUrl"], pages: tomongo};
        // do some work here with the database.
        collection.insert([presentationsdb], function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
          }
          //Close connection
          db.close();
        });
      }
    });
/**
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('presentations');

        // Insert some users
        collection.find().toArray(function (err, result) {
          if (err) {
            console.log(err);
          } else if (result.length) {
            presentations = []
            for (i = 0; i < result.length; i++) {
              var tmpdata = result[i];
              var presentation = {}
              presentation["title"] = tmpdata["name"];
              presentation["thumbnail"] = tmpdata["thumbnail"];
              presentation["id"] = tmpdata["_id"];
              presentations.push(presentation);
            }
            console.log('Found:', result);
          } else {
            console.log('No document(s) found with defined "find" criteria!');
          }
          //Close connection
          db.close();
        });
      }
    });
**/
/**
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('presentations');

        // Insert some users
        collection.find({_id: new ObjectID("55ebefc72355886018800c13")}).toArray(function (err, result) {
          if (err) {
            console.log(err);
          } else if (result.length) {
            slides = [];
            for (i = 0; i < result.length; i++) {
              var tmpdata = result[i];
              slides.push(tmpdata["posterUrl"]);
            }
            console.log('Found:', result);
          } else {
            console.log('No document(s) found with defined "find" criteria!');
          }
          //Close connection
          db.close();
        });
      }
    });
**/
    res.end("File uploaded.");
  }
});

app.get('/presentations', function(req, res, next) {
  var presentations = []
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      // Get the documents collection
      var collection = db.collection('presentations');

      // Insert some users
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
          for (i = 0; i < result.length; i++) {
            var tmpdata = result[i];
            var presentation = {}
            presentation["title"] = tmpdata["name"];
            presentation["thumbnail"] = tmpdata["thumbnail"];
            presentation["id"] = tmpdata["_id"];
            presentations.push(presentation);
          }
          console.log('Found:', result);
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        //Close connection
        db.close();
      });
    }
  });
  res.json({"results": presentations})
});

app.get('/slides', function(req, res, next) {
  var idInString = req["query"]["pid"];
  var presentationId = parseInt(idInString);
  var slidesR = []
  console.log(slides.length)

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      // Get the documents collection
      var collection = db.collection('presentations');

      // Insert some users
      collection.find({_id: new ObjectID(idInString)}).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
          for (i = 0; i < result.length; i++) {
            var tmpdata = result[i];
            var slide = {}
            slide["title"] = tmpdata["title"];
            slide["posterUrl"] = tmpdata["posterUrl"];
            slideR.push(slide);
          }
          console.log('Found:', result);
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        //Close connection
        db.close();
      });
    }
  });
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

    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('presentations');

        // Insert some users
        collection.find({_id: new ObjectID(data)}).toArray(function (err, result) {
          if (err) {
            console.log(err);
          } else if (result.length) {
            slides = [];
            for (i = 0; i < result.length; i++) {
              var tmpdata = result[i];
              slides.push(tmpdata["posterUrl"]);
            }
            console.log('Found:', result);
          } else {
            console.log('No document(s) found with defined "find" criteria!');
          }
          //Close connection
          db.close();
        });
      }
    });

    io.emit('sendList', {'slides': slides})
  });
  console.log('a user connected');
});

// use express return the list of presentations

http.listen(3000, function(){
  console.log('listening on *:3000');
});
