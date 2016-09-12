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
        accessTokenSecret: 'XT6PRpRuehFsyMa2',
        refreshTokenSecret: 'JWPVzFWkqGxoE2C2'
    },
    tokenFormat: 'jwt',
    aws:{
      "region": "us-east-1",
      "dynamodb":{
        "local": true
      }
    }
}
