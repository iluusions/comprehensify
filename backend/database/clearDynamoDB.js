const { DynamoDBClient, ListTablesCommand, DeleteTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: 'us-west-2',
  endpoint: 'http://localhost:8000' // Local DynamoDB instance
});
const docClient = DynamoDBDocumentClient.from(client);

const clearDynamoDB = async () => {
  try {
    // List all tables
    const listTablesCommand = new ListTablesCommand({});
    const tablesData = await client.send(listTablesCommand);
    const tableNames = tablesData.TableNames;

    if (tableNames.length === 0) {
      console.log('No tables to delete.');
      return;
    }

    // Delete each table
    for (const tableName of tableNames) {
      const deleteTableCommand = new DeleteTableCommand({ TableName: tableName });
      await client.send(deleteTableCommand);
      console.log(`Deleted table: ${tableName}`);
    }

    console.log('All tables deleted successfully.');
  } catch (err) {
    console.error('Error clearing DynamoDB:', err);
  }
};

clearDynamoDB();
