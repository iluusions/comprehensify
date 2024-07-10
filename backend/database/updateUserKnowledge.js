const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2', endpoint: 'http://localhost:8000' });
const docClient = DynamoDBDocumentClient.from(client);

const updateUserKnowledge = async (userID, topic, level) => {
  // Find the rowID for the given userID
  const scanParams = {
    TableName: 'userInfo',
    FilterExpression: 'userID = :userID',
    ExpressionAttributeValues: {
      ':userID': userID
    }
  };

  const scanResult = await docClient.send(new ScanCommand(scanParams));
  if (scanResult.Items.length === 0) {
    console.error(`User with userID: ${userID} not found`);
    return;
  }
  
  const rowID = scanResult.Items[0].rowID;

  const updateParams = {
    TableName: 'userInfo',
    Key: {
      'rowID': rowID,
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

  const updateResult = await docClient.send(new UpdateCommand(updateParams));
  console.log('Updated genKnowledge:', updateResult.Attributes.genKnowledge);
};

// Example usage:
// updateUserKnowledge('example@example.com', 'Science', 8).catch(console.error);

module.exports = updateUserKnowledge;
