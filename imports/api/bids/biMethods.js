import { Meteor } from 'meteor/meteor';
import {Auctions, Bids, Intervals} from '../cols.js'

Meteor.methods({
    "bids.insert"({auctionId, index, amount}){
        if (Intervals[index] !== amount) throw new Meteor.Error()
        const bidder = this.userId
        Bids.insert({userId: bidder, auctionId: auctionId, date: new Date(), index, amount})
    }
})