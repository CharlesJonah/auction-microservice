import { v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors'
import commonMiddleWare from "../lib/commonMiddleWare";
import validator from "@middy/validator";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const {title} = event.body;
  const {email} = event.requestContext.authorizer
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1)
  const auction = {
    id: uuid(),
    title,
    seller: email,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    }
  }
  try {
    await dynamodb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise()
  }catch (error){
    console.log(error)
    throw createError(500, "server error")
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleWare(createAuction).use(validator({
      inputSchema: createAuctionSchema,
      ajvOptions: {
        useDefaults: true, strict: true,
      }
    }
));


