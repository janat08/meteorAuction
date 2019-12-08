import { Meteor } from 'meteor/meteor';
import {Auctions, AuctionTypes, BidTypeIndexes, BidTypes} from '../cols.js'

Meteor.methods({
    'auctions.insert'({title, type: typeText, minimum, description}) {
      const now = new Date()
      const type = typeText*1
      console.log(AuctionTypes)
    if ([0,1,2].indexOf(type) == -1) throw new Meteor.Error("Error")
    const auctionId = Auctions.insert({
      title,
      type,
      minimum,
      typeName: AuctionTypes[type],
      createdAt: new Date(),
      description,
    });
    if (type != 0){
          const typeIndex = BidTypeIndexes[type]-1
    const amount = BidTypes[typeIndex]
        Meteor.call('bids.insert', {index: typeIndex, auctionId, amount, show: false})
    }
    return auctionId
  },
      "auctions.remove.all"(){
        Auctions.remove({})
    }
})