# node-oauth-server-v2
A node.js oauth2 Authorization Server

When running this locally it will use [dynamo-local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).  
You can change this in the [default config](../blob/master/config/default.js):
```
   aws:{
      "region": "us-east-1",
      "dynamodb":{
        "local": true
      }
    }
```


## Deploy
This is currently setup using elastic beanstalk.  To deploy an update
```
eb deploy
```

## Note
bcrypt is used for password/secret hashing.  Make sure you have the latest version of NPM installed or you may run into issues.
To build in windows: *https://github.com/nodejs/node-gyp#user-content-installation
```
*npm -g install npm@latest
```
