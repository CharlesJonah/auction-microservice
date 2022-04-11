import AWS from 'aws-sdk';
import commonMiddleWare from "../lib/commonMiddleWare";
import createError from 'http-errors'

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function deleteAuction(event, context) {
   let auction;
   const{id} = event.pathParameters;
   try {
       const result = await dynamodb.delete({
           TableName: process.env.AUCTIONS_TABLE_NAME,
           Key: { id }
       }).promise()

       auction = result.$response
   }catch (error){
       console.error(error);
       throw createError(500, error)
   }

    return {
        statusCode: 200,
        body: JSON.stringify({message: "auction deleted!"}),
    };
}

export const handler = commonMiddleWare(deleteAuction);

