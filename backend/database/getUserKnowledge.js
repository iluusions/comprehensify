const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2', endpoint: 'http://localhost:8000' });
const docClient = DynamoDBDocumentClient.from(client);

const getUserKnowledge = async (userID) => {
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

  const getParams = {
    TableName: 'userInfo',
    Key: {
      'rowID': rowID,
      'userID': userID
    },
    ProjectionExpression: 'genKnowledge'
  };

  const result = await docClient.send(new GetCommand(getParams));
  console.log('User genKnowledge:', result.Item.genKnowledge);
  return result.Item.genKnowledge;
};

// Example usage:
// getUserKnowledge(1).catch(console.error);

module.exports = getUserKnowledge;
