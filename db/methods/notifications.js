var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

var tableName = 'Notifications';

/* Create a Notification */
/* Async function creates a Notification in the DB. Should return a promise */
function create(classID, notificationMessage){
  var params = {
      TableName:tableName
  };
  console.log("Create was invoked");
  var values = {
    classID: classID,
    timestamp: Date.now(),
    notificationMessage: notificationMessage
  };
  params.Item = values;
  return docClient.put(params).promise();
}

/* Async function returns all Notifications by classID within the DB (Within the same classroom) */
function findAll(classID){
  let params = {
      TableName:tableName
  };
  let notifs = [];

  if (classID){
    params.KeyConditionExpression = "classID = :yo";
    params.ExpressionAttributeValues = {":yo":classID};
  }
  
  return new Promise(function(res, rej){
    docClient.query(params).promise().then(function(data){
      
      data.Items.forEach(function(notif){
        notifs.push(notif);
      });
      res(notifs);
    });
  })
}

module.exports = {
  create: create,
  findAll: findAll
}

/* Tests */

/*

findAll('a').then(function(a){
  console.log(a);
});


create('a','wkjnegkjwgnqkj').then(function(a){
  console.log(a);
});

*/


