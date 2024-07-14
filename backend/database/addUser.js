const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-1', endpoint: process.env.DATABASE });
const docClient = DynamoDBDocumentClient.from(client);

const addNewUser = async (userID, topic, level) => {
    const params = {
        TableName: 'userInfo',
        Item: {
            'userID': userID,
            'genKnowledge': {
                [topic]: level
            }
        },
        ConditionExpression: "attribute_not_exists(userID)" // Ensures userID is unique
    };

    try {
        await docClient.send(new PutCommand(params));
        console.log(`Added user with userID: ${userID}`);
    } catch (error) {
        console.error("Error adding new user:", error);
        throw error; // Better error handling
    }
};

module.exports = addNewUser;
