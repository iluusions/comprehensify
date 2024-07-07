const { DynamoDBClient, CreateTableCommand, KeyType } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'us-west-2',
  endpoint: 'http://localhost:8000' // Local DynamoDB instance
});

const params = {
  TableName: 'userInfo',
  KeySchema: [
    { AttributeName: 'rowID', KeyType: 'HASH' }, // Partition key
    { AttributeName: 'userID', KeyType: 'RANGE' } // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'rowID', AttributeType: 'N' }, // Number type for rowID
    { AttributeName: 'userID', AttributeType: 'N' } // Number type for userID
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

const run = async () => {
  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  }
};

run();
