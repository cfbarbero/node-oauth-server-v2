var config = require('config'),
    AWS = require('aws-sdk'),
    seeder = require('dynamo-seeder'),
    data = require('./data.json'),
    _ = require('lodash');

var awsConfig = config.get('aws');
AWS.config.update(awsConfig);
if (config.get('aws.dynamodb.local')) {
    AWS.config.dynamodb.endpoint = "http://localhost:8000";
}

var run = function() {

    var dynamoConfig = config.get('model.options');
    if (dynamoConfig.get('seedDB') ) {
        seeder.connect();

        seeder.seed(data, {
                dropTables: dynamoConfig.get('dropTables')
            })
            .then(() => {
                console.log('Seed Complete');
            })
            .catch(err => {
                console.log('Error Seeding:', err);
            });
    }
}


module.exports = {
    run: run
}
