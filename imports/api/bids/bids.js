import { Mongo } from 'meteor/mongo';

export const Bids = new Mongo.Collection('bids');
export const BidTypes = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000]

//used to determine starting bid, corresponding to auction type
const typePrices = [30, 100, 300]
export const BidTypeIndexes = typePrices.map(x=>{
    return BidTypes.indexOf(x)
})