var db = require('./db');


db.classrooms.findOne('s').then(function(a){
  console.log(a);
});
