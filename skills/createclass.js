var request = require('request');
module.exports = function(controller) {
    controller.hears(['^Create classroom(.*)'], 'direct_message,direct_mention', function(bot, message) {
        bot.startConversation(message, function(err, convo) {
            var classname = ""; 
            convo.ask("Please type the name of your classroom", function(response, convo) {
                classname = response.text
                request({
                    url: "https://api.ciscospark.com/v1/rooms",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
                    },
                    json: true,   // <--Very important!!!
                    body: {
                        title: response.text
                    }
                }, function (error, response, body){
                    //db.addClassRoom(classname, body.id);
                    console.log(body.id)
                }) 
                convo.next(); 
            }); 
            convo.say("Your classroom has been created. You may now add other members.");
        }); 
    }); 
}