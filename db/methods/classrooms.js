var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

var tableName = 'Classrooms';

/* Create a classroom */
/* Async function creates a Classroom in the DB. Should return a promise */
function create(classID, teacherID, authID, className){
  var params = {
      TableName:tableName
  };
  console.log("Create was invoked");
  var values = {
    classID: classID,
    teacherID: teacherID,
    authID: authID,
    className: className,
    takingAttendance: false
  };
  params.Item = values;
  return docClient.put(params).promise();
}

/* Find a classroom */
/* Async function finds a classroom by the classID */
function findOne(classID){
    let params = {
      TableName:tableName
  };
  params.Key = {classID: classID};
  return new Promise(function(res, rej){
      docClient.get(params).promise().then(function(a){
        res(a.Item);
      });
  });
}

/* Find a classroom by name */
/* Async function to find classroom by name */
function findByName(className){
  let params = {
      TableName:tableName
  };
  let classes = [];

  /* Optionally filter results by classID, Does not improve scan performance */
  if (className){
    params.FilterExpression = "className = :yo";
    params.ExpressionAttributeValues = {":yo":className};
  }
  
  return new Promise(function(res, rej){
    docClient.scan(params).promise().then(function(data){
      
      data.Items.forEach(function(c){
        classes.push(c);
      });
      if (classes.length > 0){
          res(classes[0]);
      } else {
          res(undefined);
      }
    });
  })
}

/* Set whether the class is taking attendance or not */
function setTakingAttendance(classID, takingAttendance){
  let params = {
      TableName:tableName
  };
  params.Key = {classID: classID};
  params.UpdateExpression = 'set takingAttendance = :yo';
  params.ExpressionAttributeValues = {':yo': takingAttendance};
  //console.log(params);
  
  return new Promise(function(res, rej){
    docClient.update(params).promise().then(function(a){
      res(a.Item);
    });
  });
}




/* Tests */


/*
setTakingAttendance('a', true).then(function(a){
  console.log(a);
});


findByName('c').then(function(a){
  console.log(a);
});

findOne('a').then(function(a){
  console.log(a);
});

create('a','b', 'c', 'd').then(function(a){
  console.log(a);
});

*/

module.exports = {
  create: create,
  findOne: findOne,
  findByName: findByName,
  setTakingAttendance: setTakingAttendance
}