import { Meteor } from 'meteor/meteor';
import { MaxBids, Auctions, Bids, BidTypes, BidTypesObj, Jobs } from '../cols.js'
import moment from 'moment'

export function bidInsert({ auctionId, amount, show = true, userId, maxBidWars: maxBidWarsUnverified = false }) {
    const auction = Auctions.findOne(auctionId)
    if (auction.minimum > amount) {
        throw new Meteor.Error("Bid below seller's minimum")
    }
    if (this.connection) {
        var bidder = this.userId
        var maxBidWars = false
    }
    else {
        var maxBidWars = maxBidWarsUnverified
        var bidder = userId
    }
    if (!bidder) throw new Meteor.Error('not logged in')
    if (userId && this.userId && userId != this.userId) throw new Meteor.Error("can't bid on behalf other users")
    if (typeof BidTypesObj[amount] == "undefined") throw new Meteor.Error("wrong amount")
    const hash = Meteor.users.findOne(bidder).profile.hashedUsername
    return Bids.insert({ hashedUsername: hash, auctionIdIndex: auctionId + amount, userId: bidder, auctionId, date: new Date(), amount, show },
        (err, res) => {
            if (err) {
                throw new Meteor.Error('another user made the same bid before you')
            }
            if (moment(auction.endDate).diff(moment(), 'minutes') < 60) {
                console.log('diff of 60 mins')
                Auctions.update(auctionId, {$set: {endDate: moment().add(5, 'minutes').toDate()}})
                Jobs.find('deactivateAuction', auctionId, function(res){
                    if (res){
                        this.reschedule({
                            in: {
                                minutes: 5
                            }
                        })
                    }
                })
            }
            //extend the completion job
            if (!maxBidWars) {
                const max = MaxBids.findOne({ auctionId })
                if (max) {
                    if (max.userId != bidder) {
                        const next = BidTypes[BidTypesObj[amount] + 1]
                        if (max.amount >= next) {
                            bidInsert({ auctionId, amount: next, userId: max.userId })
                        }
                    }
                    else {
                        if (max.amount <= amount) {
                            MaxBids.remove({ userId: bidder, auctionId })
                        }
                    }
                }
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
