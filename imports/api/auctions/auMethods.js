import { Meteor } from 'meteor/meteor';
import {Auctions, AuctionTypes, BidTypeIndexes, BidTypes} from '../cols.js'

Meteor.methods({
    'auctions.insert'({title, type: typeText, minimum}) {
      console.log([1,0].indexOf(0))
      const type = typeText*1
    if ([0,1,2].indexOf(type) == -1) throw new Meteor.Error("Error")
    const auctionId = Auctions.insert({
      title,
      type,
      minimum,
      typeName: AuctionTypes[type],
      createdAt: new Date(),
    });
    console.log(auction)
    let typeIndex = BidTypeIndexes[type]-1
    if (type != 0){
        Meteor.call('bids.insert', {index: typeIndex-1, auctionId, amount: BidTypes[typeIndex], show: false})
    }
  },
})