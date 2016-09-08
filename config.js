module.exports = {
    model: 'dynamo',
    seedDB: true,
    dynamoTables: {
        oauthAccessToken: "oauth2accesstoken",
        oauthAuthCode: "oauth2authcode",
        oauthRefreshToken: "oauth2refreshtoken",
        oauthClient: "oauth2client",
        oauthUser: "oauth2user"
    },
    // the expiry times should be consistent between the oauth2-server settings
    // and the JWT settings (not essential, but makes sense)
    accessTokenExpirySeconds: 1800, // 30 minutes
    refreshTokenExpirySeconds: 1209600, // 14 days
    jwt: {
        issuer: 'thisdemo',
        accessTokenSecret: 'XT6PRpRuehFsyMa2',
        refreshTokenSecret: 'JWPVzFWkqGxoE2C2'
    }
}
