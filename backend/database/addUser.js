const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2', endpoint: 'http://localhost:8000' });
const docClient = DynamoDBDocumentClient.from(client);

const addNewUser = async (userID, topic, level) => {
  // Check if the userID (email) already exists
  const scanParamsIDCheck = {
    TableName: 'userInfo',
    FilterExpression: 'userID = :userID',
    ExpressionAttributeValues: {
      ':userID': userID
    }
  };

  const scanResultIDCheck = await docClient.send(new ScanCommand(scanParamsIDCheck));
  if (scanResultIDCheck.Items.length != 0) {
    throw new Error("User ID is already taken");
  }

  // Get the current highest rowID to generate the next rowID
  const scanParams = {
    TableName: 'userInfo',
    ProjectionExpression: 'rowID'
  };

  const scanResult = await docClient.send(new ScanCommand(scanParams));
  const maxRowID = scanResult.Items.length ? Math.max(...scanResult.Items.map(item => item.rowID)) : 0;
  const newRowID = maxRowID + 1;

  const params = {
    TableName: 'userInfo',
    Item: {
      'rowID': newRowID,
      'userID': userID,
      'genKnowledge': {
        [topic]: level
      }
    }
  };

  await docClient.send(new PutCommand(params));
  console.log(`Added user with rowID: ${newRowID}`);
};

// Example usage:
// addNewUser('example@example.com', 'Mathematics', 7).catch(console.error);

module.exports = addNewUser;
