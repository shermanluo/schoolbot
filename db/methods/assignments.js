var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

var tableName = 'Assignments';

/* Create an Assignment */
/* Async function creates a Assignment in the DB. Should return a promise */
function create(studentID, title, classID, grade, maxPoints){
  var params = {
      TableName:tableName
  };
  console.log("Create was invoked");
  var values = {
    studentID: studentID,
    title: title,
    classID: classID,
    grade: grade,
    timestamp: Date.now(),
    maxPoints: maxPoints
  };
  
  params.Item = values;
  return docClient.put(params).promise();
}

/* Find all assignments for a student */
function findByStudent(studentID){
    let params = {
      TableName:tableName
  };
  let assignments = [];

  if (studentID){
    params.KeyConditionExpression = "studentID = :yo";
    params.ExpressionAttributeValues = {":yo":studentID};
  }
  
  return new Promise(function(res, rej){
    docClient.query(params).promise().then(function(data){
      
      data.Items.forEach(function(assignment){
        assignments.push(assignment);
      });
      res(assignments);
    });
  })
}


/* Update grades of Assignments */
function updateGrade(studentID, title, grade){
    let params = {
      TableName:tableName
  };
  params.Key = {
    studentID: studentID,
    title: title
  };
  params.UpdateExpression = 'set grade = :yo';
  params.ExpressionAttributeValues = {':yo': grade};
  //console.log(params);
  
  return new Promise(function(res, rej){
    docClient.update(params).promise().then(function(a){
      res(a.Item);
    });
  });
}

/* Tests */

module.exports = {
  create: create,
  findByStudent: findByStudent,
  updateGrade: updateGrade
}

