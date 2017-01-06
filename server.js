var express = require('express');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var testurl = require('./testurl.js');


// Mongodb connection url
var urlDb = process.env.MONGOLAB_URL1;

/*
// Use the connect method to conenct to the server
MongoClient.connect(urlDb, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});
*/

var app = express();

/*
app.all("*", function(req, res, next){
  res.writeHead(200, {"Content-Type": "text/plain"});
  next();
});
*/

app.get('', function(req, res){
  res.sendFile(process.cwd() + '/index.html');
});

app.get('/new/:longurl*', function(req, res){
  var hostName = req.headers.host;
  var longAddress = req.params['longurl'] + req.params[0];
  if (testurl.test(longAddress)) {
    var theJson = { "original_url": longAddress, "short_url": "short url will go here"};
    MongoClient.connect(urlDb, function(err, db) {
      if (err) throw err;
      var collection = db.collection('urls');
      collection.find({"original_url": longAddress},{"original_url": 1, "short_url": 1, _id: 0}).toArray(function(err, documents){
        if (err) throw err
        if (documents.length > 0) {
          theJson = documents[0];
          db.close();
          res.send(theJson);
        }
        else if (documents.length === 0) {
          console.log("No document with that url...making a new one...");
          var numbers = db.collection('numbers');
          numbers.find().toArray(function(err, documents2){
            if (err) throw err;
            var theCount = documents2[0].count + 1;
            var numbersId = documents2[0]["_id"];
            theJson = {
              "original_url": longAddress,
              "short_url": hostName + "/" + theCount
            }
            numbers.update({ _id: numbersId }, { $set: {'count': theCount}}, function(err){
              if (err) throw err;
            });
            collection.insert(theJson, function(err, data) {
              if (err) throw err;
              db.close();
            });
            theJson = {
              "original_url": longAddress,
              "short_url": hostName + "/" + theCount
            }
            res.send(JSON.stringify(theJson));
          });
        }
      });
    });
  }
  else {
    var theJson = {"error": "URL invalid"};
    res.send(theJson);
  }
});

app.get('/:short', function(req, res){
  var shortId = req.params.short;
  var hostName = req.headers.host;
  MongoClient.connect(urlDb, function(err, db){
    if (err) throw err;
    var collection = db.collection('urls');
    var urlSearch = hostName + "/" + shortId;
    collection.find({"short_url": urlSearch}, {"original_url": 1, "short_url": 1, _id: 0}).toArray(function(err, documents){
      if (documents.length === 0) {
        var theJson = {"error": "Url is not in the database."};
        db.close();
        res.send(theJson);
      }
      else {
        var urlSendTo = documents[0]["original_url"];
        db.close();
        res.redirect(urlSendTo);
      }
    });
  });
});

app.get("*", function(req, res){
  res.end("404!");
});

app.listen(3000, function(){
  console.log('You are now listening to local port 3000!');
});
