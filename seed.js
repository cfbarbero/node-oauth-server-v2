var config = require('./config.js'),
    awsConfig = require('./aws.json'),
    AWS = require('aws-sdk'),
    bcrypt = require('bcrypt-as-promised'),
    _ = require('lodash');

AWS.config.loadFromPath(__dirname + '/aws.json');
AWS.config.dynamodb = awsConfig.dynamodb;
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var run = function() {
    if (config.model.options.createTables) {
        console.log('Creating Tables');
        createTables();
    }

    if (config.model.options.seedDB) {
        console.log('Seeding Data');
        seedData();
    }
}



var createTables = function() {
    var tableDefinitions = [{
        AttributeDefinitions: [{
            AttributeName: "accessToken",
            AttributeType: "S"
        }],
        TableName: config.model.options.dynamoTables.oauthAccessToken,
        KeySchema: [{
            AttributeName: "accessToken",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 12,
            WriteCapacityUnits: 6
        }
    }, {
        AttributeDefinitions: [{
            AttributeName: "refreshToken",
            AttributeType: "S"
        }],
        TableName: config.model.options.dynamoTables.oauthRefreshToken,
        KeySchema: [{
            AttributeName: "refreshToken",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    }, {
        AttributeDefinitions: [{
            AttributeName: "authCode",
            AttributeType: "S"
        }],
        TableName: config.model.options.dynamoTables.oauthAuthCode,
        KeySchema: [{
            AttributeName: "authCode",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    }, {
        AttributeDefinitions: [{
            AttributeName: "clientId",
            AttributeType: "S"
        }],
        TableName: config.model.options.dynamoTables.oauthClient,
        KeySchema: [{
            AttributeName: "clientId",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    }, {
        AttributeDefinitions: [{
            AttributeName: "username",
            AttributeType: "S"
        }],
        TableName: config.model.options.dynamoTables.oauthUser,
        KeySchema: [{
            AttributeName: "username",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    }];

    dynamodb.listTables({
            ExclusiveStartTableName: 'oauth2'
        })
        .promise()
        .then(function(data) {
            console.log('Found Tables:', data);
            _.forEach(tableDefinitions, function(table) {
                if (!_.include(data.TableNames, table.TableName)) {
                    console.log('Creating:', table.TableName);
                    dynamodb.createTable(table)
                        .promise()
                        .then(function(data) {
                            console.log('Created:', table.TableName);
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                }
            });

        });
}

var seedClients = function() {
    var clients = [{
        clientId: 'foo',
        clientSecret: 'bar',
        username: 'cfbarbero'
    }, {
        clientId: 'ThisIsALongClientId',
        clientSecret: 'bar',
        username: 'cfbarbero'
    }];

    _(clients).forEach(function(client) {
        console.log('Creating:', client);

        bcrypt.hash(client.clientSecret)
            .then(function(hash) {
                client.clientSecret = hash;
                return docClient.put({
                    TableName: config.model.options.dynamoTables.oauthClient,
                    Item: client
                }).promise();

            })
            .then(function(data) {
                console.log('Created: ', client);
            })
            .catch(function(err) {
                console.log(err);
            });
    });
}

var seedUsers = function() {
    var users = [{
        username: 'cfbarbero',
        password: 'test',
        userId: '123'
    }];

    _(users).forEach(function(user) {
        console.log('Creating:', user);

        bcrypt.hash(user.password)
            .then(function(hash) {
                user.password = hash;
                return docClient.put({
                    TableName: config.model.options.dynamoTables.oauthUser,
                    Item: user
                }).promise();
            })
            .then(function(data) {
                console.log('Created:', user);
            })
            .catch(function(err) {
                console.log(err);
            });
    });
}

var seedData = function() {
    seedClients();
    seedUsers();
}

module.exports = {
    createTables: createTables,
    seedData: seedData,
    run: run
}
