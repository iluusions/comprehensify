const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'us-west-1',
  endpoint: process.env.DATABASE // Adjust for production environment
});

const params = {
  TableName: 'userInfo',
  KeySchema: [
    { AttributeName: 'userID', KeyType: 'HASH' } // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'userID', AttributeType: 'S' } // String type for userID
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
