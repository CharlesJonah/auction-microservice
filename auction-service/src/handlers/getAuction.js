import AWS from 'aws-sdk';
import commonMiddleWare from "../lib/commonMiddleWare";
import createError from 'http-errors'

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionByID(id) {
    let auction
    try {
        const result = await dynamodb.get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: { id }
        }).promise()

        auction = result.Item
    }catch (error){
        console.error(error);
        throw createError(500, error)
    }

    if(!auction){
        throw createError(404, `Auction with ID "${id}" not found`)
    }

    return auction
}

async function getAuction(event, context) {

   const{id} = event.pathParameters;
   const auction = await getAuctionByID(id)
    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };
}

export const handler = commonMiddleWare(getAuction);


