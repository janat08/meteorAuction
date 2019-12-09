import { Meteor } from 'meteor/meteor';
import {Auctions, Bids, BidTypes} from '../cols.js'

Meteor.methods({
    "bids.insert"({auctionId, index, amount, show = true}){
        console.log(BidTypes[index], amount)
        // if (BidTypes[index] !== amount) throw new Meteor.Error("wrong amount")
        const bidder = this.userId
        Bids.insert({hashedUsername: Meteor.user().profile.hashedUsername, auctionIdIndex: auctionId+index, userId: bidder, auctionId, date: new Date(), index, amount, show})
    },
    "bids.remove.all"(){
        console.log('removing bids')
        Bids.remove({show: true})
    }
})