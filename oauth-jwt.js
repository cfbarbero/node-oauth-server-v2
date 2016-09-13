var JWT = require('jsonwebtoken'),
    AWS = require('aws-sdk'),
    config = require('config');

var awsConfig = config.get('aws');
AWS.config.update(awsConfig);

// generateToken
// This generateToken implementation generates a token with JWT.
// the token output is the Base64 encoded string.
function generateToken(type, req, callback) {
    var token;
    var secret;
    var user = req.user;
    var exp = new Date();
    var payload = {
        // public claims
        iss: config.jwt.issuer, // issuer
        //    exp: exp,        // the expiry date is set below - expiry depends on type
        //    jti: '',         // unique id for this token - needed if we keep an store of issued tokens?
        // private claims
        userId: user.userId
    };
    var options = {
        algorithms: ['HS256'] // HMAC using SHA-256 hash algorithm
    };

    if (type === 'accessToken') {
        secret = config.get('jwt.accessTokenSecret');
        exp.setSeconds(exp.getSeconds() + config.get('accessTokenExpirySeconds'));
    } else {
        secret = config.get('jwt.refreshTokenSecret');
        exp.setSeconds(exp.getSeconds() + config.get('refreshTokenExpirySeconds'));
    }
    payload.exp = exp.getTime();


    token = JWT.sign(payload, secret, options);

    callback(false, token);
};

// The bearer token is a JWT, so we decrypt and verify it. We get a reference to the
// user in this function which oauth2-server puts into the req object
function getAccessToken(bearerToken, callback) {

    return JWT.verify(bearerToken, config.get('jwt.accessTokenSecret'), function(err, decoded) {

        if (err) {
            return callback(err, false); // the err contains JWT error data
        }

        // other verifications could be performed here
        // eg. that the jti is valid

        var token = {
            expires: new Date(decoded.exp),
            userId: decoded.userId
        };
        return callback(false, token);
    });
};

// The bearer token is a JWT, so we decrypt and verify it. We get a reference to the
// user in this function which oauth2-server puts into the req object
function getRefreshToken(bearerToken, callback) {
    return JWT.verify(bearerToken, config.get('jwt.refreshTokenSecret'), function(err, decoded) {

        if (err) {
            return callback(err, false);
        }

        // other verifications could be performed here
        // eg. that the jti is valid

        // instead of passing the payload straight out we use an object with the
        // mandatory keys expected by oauth2-server plus any other private
        // claims that are useful
        return callback(false, {
            expires: new Date(decoded.exp),
            user: getUserById(decoded.userId)
        });
    });
};

// As we're using JWT there's no need to store the token after it's generated
function saveAccessToken(accessToken, clientId, expires, userId, callback) {
    return callback(false);
};


module.exports = {
    generateToken: generateToken,
    getAccessToken: getAccessToken,
    getRefreshToken: getRefreshToken,
    saveAccessToken: saveAccessToken
}
