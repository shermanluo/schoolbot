var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

var tableName = 'Users';

/* Async function creates a User in the DB. Should return a promise */
function create(userID, email, type, classrooms){
  var params = {
      TableName:tableName
  };
  console.log("Create was invoked");
  var values = {
    userID: userID,
    email: email,
    type: type,
    classrooms: classrooms
  };
  params.Item = values;
  return docClient.put(params).promise();
}

/* Async function returns a User in the DB from the userID. Should return a promise */
function findOne(userID){
    let params = {
      TableName:tableName
  };
  params.Key = {userID: userID};
  return new Promise(function(res, rej){
      docClient.get(params).promise().then(function(a){
        res(a.Item);
      });
  });
}

/* Async function returns all Users by classID within the DB (Within the same classroom) */
function findByClassroom(classID){
  let params = {
      TableName:tableName
  };
  let users = [];

  /* Optionally filter results by classID, Does not improve scan performance */
  if (classID){
    params.FilterExpression = "(contains(classrooms, :yo))";
    params.ExpressionAttributeValues = {":yo":classID};
  }
  
  return new Promise(function(res, rej){
    docClient.scan(params).promise().then(function(data){
      
      data.Items.forEach(function(user){
        users.push(user);
      });
      res(users);
    });
  })
}

module.exports = {
  create: create,
  findOne: findOne,
  findByClassroom: findByClassroom
}



/* Tests */

/*

findByClassroom('was').then(function(results){
  console.log(results);
});

findOne('yo').then(function(a,b){
  console.log('this was run');
  console.log(a);
  console.log(b);
});


create('yo','ho', 'po', ['was','s']).then(function (a, b, c){
  console.log('this was run');
  console.log(a);
  console.log(b);
  console.log(c);
});

*/
