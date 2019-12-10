import { Meteor } from 'meteor/meteor';
import { MaxBids, BidTypes, Bids, Auctions } from '../cols.js'
import { bidInsert } from '../bids/biMethods.js'
Meteor.methods({
    'maxBids.upsert' ({ amount: textAnyAmount, auctionId }) {
        if (!this.userId) throw new Meteor.Error("youre logged out")
        const auction = Auctions.findOne(auctionId)
        if (auction.minimum > amount) {
            throw new Meteor.Error("Below seller's minimum")
        }
        const anyAmount = textAnyAmount * 1
        const curr = MaxBids.findOne({ auctionId })
        const currHigh = Bids.findOne({ auctionId }, { sort: { amount: -1 } })

        const amount = BidTypes[BidTypes.findIndex((x, i, a) => {
            if ((a.length - 1) == i) {
                return true
            }
            else {
                return a[i + 1] > anyAmount
            }
        })]
        if (currHigh >= amount) {
            throw new Meteor.Error("Current highest bid is higher than your maximum value")
        }
        if (!amount) throw new Meteor.Error('amount is beneath minimum bidding')
        if (curr && curr.userId == this.userId) {
            if (curr.amount == amount) {
                console.log('throwing error')
                throw new Meteor.Error('same amount entered')
            }
            else {
                console.log('making same user update', this.userId, curr.userId)
                return MaxBids.update({ auctionId, userId: this.userId }, { $set: { amount } }, (err, res) => {
                    if (err) {
                        return Meteor.call('maxBids.upsert', { amount, auctionId })
                    }
                    else {
                        if (res != 1) {
                            return Meteor.call('maxBids.upsert', { amount, auctionId })
                        }
                    }
                })
            }
        }
        if (!curr) {
            console.log("making max bid", curr)
            return MaxBids.insert({ auctionId, amount, userId: this.userId }, (err, id) => {
                if (err) {
                    return Meteor.call('maxBids.upsert', { amount, auctionId })
                }
                else {
                    return console.log('inserted', id)
                }
            })
        }
        const currMax = curr.amount

        //bidding war simulation
        const thisUserId = this.userId
        const bidsToMake = makeBids()
        bidsToMake.forEach(x => {
            try {
                bidInsert(x)
            }
            catch (err) {
                console.log(err)
            }
        })


        //update current highest max auto bidder
        if (currMax < amount) {
            MaxBids.update({ auctionId }, { $set: { amount, userId: this.userId } })
        }
        else if (currMax == amount) {
            MaxBids.remove({ auctionId, userId: curr.userId })
        }
        //make sure that the winner has last bid
        function makeBids(currBids = [], otherTurn = false, typeIndex = 0) {
            const start = currHigh.amount
            const sorted = [currMax, amount].sort((a, b) => a - b)
            const low = sorted[0]
            const value = BidTypes[typeIndex]
            //ensures that the higher maxBidder always winds up overbidding, if
            //the loser max bidder winds up making the highest possible bid within
            //his allowance, and the higher maxBidder has to go above losers
            //allowance to stay on top
            if ((value <= low && value > start) || (low == amount && otherTurn)) {
                const lastIndex = currBids.length - 1
                const nextBid = value
                const current = { auctionId, amount: nextBid, userId: thisUserId, maxBidWars: true }
                const other = { auctionId, amount: nextBid, userId: curr.userId, maxBidWars: true }
                console.log(thisUserId, curr.userId)
                if (otherTurn) {
                    if (nextBid > curr.amount) {
                        return currBids
                    }
                    currBids.push(other)
                    return makeBids(currBids, false, typeIndex + 1)
                }
                else {
                    if (nextBid > amount) {
                        return currBids
                    }
                    currBids.push(current)
                    return makeBids(currBids, true, typeIndex + 1)
                }
            }
            else if (value <= start) {
                return makeBids(currBids, otherTurn, typeIndex + 1)
            }
            else {
                return currBids
            }
        }
    }
})
