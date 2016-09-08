var JWT = require('jsonwebtoken'),
    config = require('./config.js');

// generateToken
// This generateToken implementation generates a token with JWT.
// the token output is the Base64 encoded string.
model.generateToken = function(type, req, callback) {
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
        secret = config.jwt.accessTokenSecret;
        exp.setSeconds(exp.getSeconds() + config.accessTokenExpirySeconds);
    } else {
        secret = config.jwt.refreshTokenSecret;
        exp.setSeconds(exp.getSeconds() + config.refreshTokenExpirySeconds);
    }
    payload.exp = exp.getTime();

    token = JWT.sign(payload, secret, options);

    callback(false, token);
};

model.getAccessToken = function(bearerToken, callback) {

    return JWT.verify(bearerToken, config.jwt.accessTokenSecret, function(err, decoded) {

        if (err) {
            return callback(err, false); // the err contains JWT error data
        }

        // other verifications could be performed here
        // eg. that the jti is valid

        // we could pass the payload straight out we use an object with the
        // mandatory keys expected by oauth2-server, plus any other private
        // claims that are useful
        return callback(false, {
            expires: new Date(decoded.exp),
            user: getUserById(decoded.userId)
        });
    });
};

model.getRefreshToken = function(bearerToken, callback) {
    return JWT.verify(bearerToken, config.jwt.refreshTokenSecret, function(err, decoded) {

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
