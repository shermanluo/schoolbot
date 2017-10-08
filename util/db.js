var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://schoolbot:schoolbot1@ds115035.mlab.com:15035/schoolbotdata";

MongoClient.connect(url, function(err, db) {
  
})
