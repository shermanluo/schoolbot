var db = require('../db');
var request = require('request');
module.exports = function(controller) {
    controller.hears(['^submit file(.*)'], 'direct_message,direct_mention', function(bot, message) {
        bot.startConversation(message, function(err, convo) {
            var assignmentname = ""; 
            var url = "";
            var classname = ""; 
            convo.ask("Please type the name of the class this submission is for",  function(response, convo) {
                classname = response.text; 
                convo.ask("Please type the name of the assignment this submission is for. It is important that you name the correct assignment or your submission may not be graded", function(response, convo) {
                assignmentname = response.text; 
                    convo.ask("Please type the public URL of the file you wish to send", function(response, convo) {
                        url = response.text
                        //var USERID = DB.GETUSERID(MESSAGE.USER);
                        db.classrooms.findByName(classname).then(function(user) {
                            var classobj = user; 
                            db.assignments.create(classobj.classID, message.personId, url, -1).then(function(user) {
                            }); 
                        });
                        var classinfo = {classID: 'Ymksfdafdajfkj...', userID: 'Y2lzY29zcGFyazovL3VzL1BFT1BMRS83MmM1YjdiMS0yNTg2LTQ2MGEtYjRkNy01OTFmNzAyNWIzMDk', authIDL: 'Ykjfwdnfjk'};
                        //var classinfo = db.classrooms.findOne(USERID);
                        var teacherID = classinfo.userID
                        request({
                            url: "https://api.ciscospark.com/v1/messages",
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8',
                                'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
                            },
                            json: true,   // <--Very important!!!
                            body: {
                                toPersonId: teacherID,
                                text: "new submission from " + message.user + " for " + assignmentname
                            }
                        })

                        request({
                            url: "https://api.ciscospark.com/v1/messages",
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8',
                                'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
                            },
                            json: true,   // <--Very important!!!
                            body: {
                                toPersonId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS83MmM1YjdiMS0yNTg2LTQ2MGEtYjRkNy01OTFmNzAyNWIzMDk",
                                //toPersonId: db.getTeacher(Y2lzY29zcGFyazovL3VzL1JPT00vOGFlYWExZDAtYWI5Yy0xMWU3LWEyOWItMmRlMTAyNTBkMjRm),
                                file: url
                            }
                        })
                        convo.next();
                    });
                    convo.next(); 
                });
                convo.next(); 
            });
        }); 
    }); 
  
    controller.hears(['^check submission(.*)'], 'direct_message,direct_mention', function(bot, message) {
        bot.startConversation(message, function(err, convo) {
            var classname = ""; 
            convo.ask("Please type the name of the class you would like to check", function(response, convo) {
                classname = response.text; 
                var assignmentname = ""; 
                convo.ask("Please type the name of the assignment you would like to check", function(response, convo) {
                    assignmentname = response.text; 
                    convo.next(); 
                });
                var returnurl = "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678134-sign-check-512.png";
                //if (db.getFileURL(classname, message.user, assignmentname)) {
                      //returnurl = db.getFileURL(message.user, message.user, assignmentname); 
                //} else {
                      convo.say("You have not submitted for " + assignmentname + ". Please check that the assignment name you entered is correct.");
                //}
                convo.say(returnurl);
                
                convo.next(); 
            });
        }); 
    });
};


      
      
      
      
      
     