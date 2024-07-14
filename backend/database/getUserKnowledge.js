const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-1', endpoint: process.env.DATABASE });
const docClient = DynamoDBDocumentClient.from(client);

const getUserKnowledge = async (userID) => {
    const getParams = {
        TableName: 'userInfo',
        Key: {
            'userID': userID
        },
        ProjectionExpression: 'genKnowledge'
    };

    try {
        const result = await docClient.send(new GetCommand(getParams));
        if (!result.Item) {
            console.log(`User with userID: ${userID} not found`);
            return;
        }
        console.log('User genKnowledge:', result.Item.genKnowledge);
        return result.Item.genKnowledge;
    } catch (error) {
        console.error(`Failed to get user knowledge for userID: ${userID}`, error);
        throw error;
    }
};

module.exports = getUserKnowledge;
