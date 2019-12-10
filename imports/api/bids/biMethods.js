import { Meteor } from 'meteor/meteor';
import { Auctions, Bids, BidTypes, BidTypesObj } from '../cols.js'

export function bidInsert ({ auctionId, amount, show = true, userId }) {
        const bidder = this.userId? this.userId : userId
        if (!bidder) throw new Meteor.Error('not logged in')
        if (userId && this.userId && userId != this.userId) throw new Meteor.Error("can't bid on behalf other users")
        if (!BidTypesObj[amount]) throw new Meteor.Error("wrong amount")
        const hash = Meteor.users.findOne(bidder).profile.hashedUsername
        Bids.insert({ hashedUsername: hash, auctionIdIndex: auctionId + amount, userId: bidder, auctionId, date: new Date(), amount, show },
            (err, res) => {
                if (err) {
                    console.log(err)
                    throw new Meteor.Error('another user made the same bid before you')
                }
            })
    }

Meteor.methods({
    "bids.insert": bidInsert,
    "bids.remove.all" () {
        console.log('removing bids')
        Bids.remove({ show: true })
    }
})
