var config = require('../config.js'),
    awsConfig = require('../aws.prod.json'),
    AWS = require('aws-sdk'),
    seeder = require('dynamo-seeder'),
    data = require('./data.json'),
    _ = require('lodash');

AWS.config.update(awsConfig);
AWS.config.dynamodb = awsConfig.dynamodb;

var run = function() {

    seeder.connect();

    seeder.seed(data, {
            dropTables: true
        })
        .then(() => {
            console.log('Seed Complete');
        })
        .catch(err => {
            console.log('Error Seeding:', err);
        });
}


module.exports = {
    run: run
}
