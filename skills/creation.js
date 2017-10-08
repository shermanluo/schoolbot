var request = require('request')
module.exports = function(controller) {
    controller.hears(['^create room (.*)'], 'direct_message,direct_mention', function(bot, message) {
    
    var name = message.match[1]; 
    request({
    url: "https://api.ciscospark.com/v1/rooms",
    method: "POST",
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
    },
    json: true,   // <--Very important!!!
    body: {
          "title": name
    }
    }, function (error, response, body){
      console.log(body.id);
      request({
      url: "https://api.ciscospark.com/v1/memberships",
      method: "POST",
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
      },
      json: true,   // <--Very important!!!
      body: {
          "roomId": body.id,
          "personEmail": message.user
      },
      }, function (error, response, body){
        request({
          url: "https://api.ciscospark.com/v1/authorize",
          method: "GET",
          json: true,   // <--Very important!!!
          qs: {
              "response_type": "code",
              "client_id": 'C2bd41b78a3eea7f6d5143f6363cd44e19a605138a28ff2766ec9bbd2ba10b5be',
              "redirect_uri": 'https://diamond-pheasant.glitch.me/',
              "scope": 'spark:messages_read',
              "state": 'success'
          },
          }, function (error, response, body){
            
          });
      });
    });
    });
  
    
};

