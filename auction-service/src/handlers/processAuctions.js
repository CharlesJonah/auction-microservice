import {getEndedAuctions} from "../lib/getEndedAuction";
import {closeAuction} from "../lib/closeAuction";
import createError from 'http-errors'
async function processAuctions(event, context){

    try{
        const auctionsToClose = await getEndedAuctions()
        // console.log(auctionsToClose, "--------------------------> auctions to close")
        const closePromises = auctionsToClose.map(auction => closeAuction(auction))
        await Promise.all(closePromises);
        return {closed: closePromises.length};
    }catch (error){
        console.error(error);
        throw createError(500, error)
    }
}

export const handler = processAuctions;