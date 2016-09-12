module.exports = {
    model: {
        name: 'dynamo',
        options: {
            seedDB: false,
            dropTables: false
        },
    },
    aws: {
        "dynamodb": {
            "local": false
        }
    }
}
