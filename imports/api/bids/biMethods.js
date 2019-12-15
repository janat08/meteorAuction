import { Meteor } from 'meteor/meteor';
import { MaxBids, Auctions, Bids, BidTypes, BidTypesObj, Jobs } from '../cols.js'
import moment from 'moment'

export function bidInsert({ auctionId, amount, show = true, userId, maxBidWars: maxBidWarsUnverified = false }) {
    const auction = Auctions.findOne(auctionId)

    if (moment(auction.endDate).diff(moment(), 'seconds') < 0) throw new Meteor.Error('Auction has ended')
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
    const inserted = Bids.insert({ hashedUsername: hash, auctionIdIndex: auctionId + amount, userId: bidder, auctionId, date: new Date(), amount, show },
        (err, res) => {
            if (err) {
                throw new Meteor.Error('another user made the same bid before you')
            }
            if (moment(auction.endDate).diff(moment(), 'minutes') <= 5) {
                const newEndDate = moment(auction.endDate).add(5, 'minutes').toDate()
                Auctions.update(auctionId, { $set: { endDate: newEndDate } })
                SyncedCron.remove('deactivate auction' + auctionId)
                SyncedCron.add({
                    name: 'deactivate auction' + auctionId,
                    schedule: function(parser) {
                        return parser.recur().on(newEndDate).fullDate()
                    },
                    job: function() {
                        const winner = Bids.findOne({ auctionId, show: true }, { sort: { amount: -1 } })
                        Auctions.update(auctionId, { $set: { active: false, finished: true, winner: winner && winner.userId, winnerAmount: winner && winner.amount } })
                    }
                });
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
    if (auction.minimum > amount) {
        throw new Meteor.Error("Bid below seller's minimum")
    } else {
        return inserted
    }
}

Meteor.methods({
    "bids.insert": bidInsert,
    "bids.remove.all" () {
        console.log('removing bids')
        Bids.remove({ show: true })
    }
})

console.log(moment().diff(moment().add(3, 'days'), 'minutes'))
