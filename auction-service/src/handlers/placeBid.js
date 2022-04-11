import AWS from 'aws-sdk';
import commonMiddleWare from "../lib/commonMiddleWare";
import createError from 'http-errors'
import {getAuctionByID} from "./getAuction";
import validator from "@middy/validator";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";
import placeBidSchema from "../lib/schemas/placeBidSchema";
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {

   const { id } = event.pathParameters;
   const {amount} = event.body;
   const {email} = event.requestContext.authorizer

   const auction = await getAuctionByID(id);

    if(email === auction.seller){
        throw createError(401, "you cannot bid on your own Auction!")
    }

    if(email === auction.highestBid.bidder){
        throw createError(401, "you are already the highest bidder")
    }

   if(auction.status !== "OPEN"){
       throw createError(401, "cannot place bid on closed auction")
   }
   if(amount <= auction.highestBid.amount){
       throw createError(400, `Your bid must be higher than ${auction.highestBid.amount}!`)
   }
   const params = {
       TableName: process.env.AUCTIONS_TABLE_NAME,
       Key: { id },
       UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
       ExpressionAttributeValues: {
           ':amount': amount,
           ':bidder': email
       },
       ReturnValues: 'ALL_NEW'
   }

   let updatedAuction;
   try {
       const result = await dynamodb.update(params).promise()
       updatedAuction = result.Attributes

   }catch (error){
       console.error(error);
       throw createError(500, error)
   }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
}

export const handler = commonMiddleWare(placeBid).use(validator({
        inputSchema: placeBidSchema,
        ajvOptions: {
            useDefaults: true, strict: true,
        }
    }
));


