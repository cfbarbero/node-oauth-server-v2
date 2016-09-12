module.exports = {
    model: {
        name: 'dynamo',
        options: {
            seedDB: false,
            dropTables: true,
            dynamoTables: {
                oauthAccessToken: "oauth_accesstoken",
                oauthAuthCode: "oauth_authcode",
                oauthRefreshToken: "oauth_refreshtokens",
                oauthClient: "oauth_client",
                oauthUser: "oauth_user"
            }
        }
    },
    // the expiry times should be consistent between the oauth2-server settings
    // and the JWT settings (not essential, but makes sense)
    accessTokenExpirySeconds: 1800, // 30 minutes
    refreshTokenExpirySeconds: 1209600, // 14 days
    jwt: {
        issuer: 'thisdemo',
        accessTokenSecret: 'hZ92$JvBfOMAT@GI43A!', // We will use envelope encryption with AWS KMS so it's ok to leave these in here.
        refreshTokenSecret: '#@7YFKW7&lS$9Z&bWsGx',
        kmsKeyArn: "arn:aws:kms:us-east-1:195702235524:key/5ba69d52-6447-4f2a-b686-ddd36fe45e66"
    },
    tokenFormat: 'jwt',
    aws:{
      "region": "us-east-1",
      "dynamodb":{
        "local": true
      }
    }
}
