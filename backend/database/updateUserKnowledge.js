const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2', endpoint: 'http://localhost:8000' });
const docClient = DynamoDBDocumentClient.from(client);

const updateUserKnowledge = async (userID, topic, level) => {
    const updateParams = {
        TableName: 'userInfo',
        Key: {
            'userID': userID
        },
        UpdateExpression: 'set genKnowledge.#topic = :level',
        ExpressionAttributeNames: {
            '#topic': topic
        },
        ExpressionAttributeValues: {
            ':level': level
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        const updateResult = await docClient.send(new UpdateCommand(updateParams));
        console.log('Updated genKnowledge:', updateResult.Attributes.genKnowledge);
    } catch (error) {
        console.error(`Failed to update user knowledge for userID: ${userID}`, error);
        throw error;
    }
};

module.exports = updateUserKnowledge;
