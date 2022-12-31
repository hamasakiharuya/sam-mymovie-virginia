'use strict';
var AWS = require('aws-sdk')
AWS.config.update({region: 'ap-northeast-1'});
// Create the DynamoDB service object
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const querystring = require('querystring');

exports.handler = (event, context, callback) => {
    
    //Get contents of request
    const request = event.Records[0].cf.request;
    
    //クエリパラメータ取得
    const params = querystring.parse(request.querystring);
    const user_id = params.user_id

    
    //dynamodbからversion取得
    var param = {
      TableName: 'user-stg-tb',
      Key: {
        'user_id': {S: user_id}
      },
      ProjectionExpression: 'follow_version'
    };
    
    // Call DynamoDB to read the item from the table
    dynamodb.getItem(param, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.Item);
        var follow_version = data.Item.follow_version.N
        //Set new headers
        const header = "X-REVISION-STRING";
            request.headers[header.toLowerCase()] = [
              { key: header, value: follow_version },
            ];
    
        //Return modified response
        callback(null, request);
      }
    });
    
};