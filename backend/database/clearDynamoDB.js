const { DynamoDBClient, DeleteTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'us-west-1',
  endpoint: process.env.DATABASE || undefined // Adjust this as needed
});

async function clearAndDeleteTable(tableName) {
  try {
    console.log(`Attempting to delete table: ${tableName}`);
    await client.send(new DeleteTableCommand({ TableName: tableName }));
    console.log(`Deletion of table ${tableName} initiated successfully.`);
    await waitForTableDeletion(tableName);
    console.log(`Table ${tableName} has been successfully deleted.`);
  } catch (error) {
    console.error('Error during table deletion process:', error);
  }
}

async function waitForTableDeletion(tableName) {
  let tableExists = true;
  do {
    try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log(`Table ${tableName} still exists. Waiting...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        tableExists = false;
      } else {
        console.error('Unexpected error during table status check:', error);
        throw error;
      }
    }
  } while (tableExists);
}

// If the script is run directly, execute the function with a specified table name
if (require.main === module) {
  const tableName = process.argv[2]; // Get table name from command line argument
  if (!tableName) {
    console.log('Please provide a table name as an argument.');
    console.log('Usage: node clearAndDeleteTable.js <tableName>');
    process.exit(1);
  }
  clearAndDeleteTable(tableName).catch(console.error);
}

module.exports = clearAndDeleteTable;
