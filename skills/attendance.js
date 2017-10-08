var db = require('../db');
var request = require('request');
var sendAnnouncement = require('./teacher')(-1);
module.exports = function(controller) {
    controller.hears(['^collect attendance for (.*)'], 'direct_message,direct_mention', function(bot, message) {
        //
        var classID; 
        
        db.users.findOne(message.data.personId).then(function(user) {
          console.log(user.classrooms);
          db.classrooms.setTakingAttendance(user.classrooms[0], true).then(function(a) {
            classID = user.classrooms[0];
            var string = message.match[0];
            var classregx = /collect attendance for (.*)/;
            var match = classregx.exec(string);
            var announcement = {title: match[1] + " is starting. ", body: "Please type: present " + match[1]};
            sendAnnouncement(announcement, classID);
            })
          
        }) 
       
    }); 
  
    controller.hears(['^stop collecting attendance for (.*)'], 'direct_message,direct_mention', function(bot, message) {
        db.users.findOne(message.data.personId).then(function(user) {
          db.classrooms.setTakingAttendance(user.classrooms[0], false).then(function(a){});
        })
    }); 
  
    controller.hears(['^present (.*)'], 'direct_message,direct_mention', function(bot, message) {    
        var match = message.match[1];
        db.users.findOne(message.data.personId).then(function(user) {
          db.assignments.create(message.data.personId, 'Attendance ' + match, user.classrooms[0], 1, 1).then(function(a) {
            bot.reply(message, 'Attendance Recorded! Thanks for attending! 😃');
          })
        });
    });
  
    
}





