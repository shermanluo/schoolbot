var AWS = require("aws-sdk");
var env = require('node-env-file');

env(__dirname + '/../.env');
console.log(process.env.aws_key);
console.log(process.env.aws_secret_key);

AWS.config.update({
  region: "us-east-2",
  endpoint: "https://dynamodb.us-east-2.amazonaws.com/",
  accessKeyId: process.env.aws_key,
  secretAccessKey: process.env.aws_secret_key
});

var dynamodb = new AWS.DynamoDB();

var users = require('./methods/users.js');
var classrooms = require('./methods/classrooms.js');
var notifications = require('./methods/notifications.js');
var assignments = require('./methods/assignments.js');


module.exports = {
  users: users,
  classrooms: classrooms,
  notifications: notifications,
  assignments: assignments
}
