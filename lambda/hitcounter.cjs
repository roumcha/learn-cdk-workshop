// @ts-check
const {
  DynamoDBClient,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>}
 */
exports.handler = async function (event) {
  console.log("request: ", JSON.stringify(event));

  const dynamo = new DynamoDBClient();
  const lambda = new LambdaClient();

  await dynamo.send(
    new UpdateItemCommand({
      TableName: process.env.HITS_TABLE_NAME,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
  );

  const resp = await lambda.send(
    new InvokeCommand({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
      Payload: JSON.stringify(event),
    })
  );
  console.log("downstream response: ", JSON.stringify(resp));
  if (!resp.Payload) throw new Error("Response Payload is empty");

  const body = JSON.parse(new TextDecoder().decode(resp.Payload)).body;
  if (!body || typeof body !== "string") {
    throw new Error("Response body is not a string");
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: body,
  };
};
