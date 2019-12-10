import { Meteor } from 'meteor/meteor';
import { Auctions, Bids, BidTypes, BidTypesObj } from '../cols.js'

Meteor.methods({
    "bids.insert" ({ auctionId, amount, show = true, userId = this.userId }) {
        if (!this.userId) throw new Meteor.Error('not logged in')
        if (userId != this.userId && this.connection) throw new Meteor.Error("can't bid on behalf other users")
        if (!BidTypesObj[amount]) throw new Meteor.Error("wrong amount")
        const bidder = userId
        const hash = Meteor.users.findOne(bidder).profile.hashedUsername
        Bids.insert({ hashedUsername: hash, auctionIdIndex: auctionId + amount, userId: bidder, auctionId, date: new Date(), amount, show },
            (err, res) => {
                if (err) {
                    throw new Meteor.Error('another user made the same bid before you')
                }
            })
    },
    "bids.remove.all" () {
        console.log('removing bids')
        Bids.remove({ show: true })
    }
})
