import { Meteor } from 'meteor/meteor';
import { MaxBids, BidTypes, Bids } from '../cols.js'
import { bidInsert } from '../bids/biMethods.js'
Meteor.methods({
    'maxBids.upsert' ({ amount: textAnyAmount, auctionId }) {
        if (!this.userId) throw new Meteor.Error("youre logged out")
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
        // const bidsAvailable = BidTypes.filter(findAppropriateBidTypes(amount))
        // console.log('bidsAvailable', bidsAvailable)
        const thisUserId = this.userId
        const bidsToMake = makeBids()
        // console.log(bidsToMake)

        console.log('toInsert', bidsToMake)
        bidsToMake.forEach(x => {
            // console.log('making insert', x.amount, x.userId)
            try {
                console.log(bidInsert)
                bidInsert(x)
            }
            catch (err) {
                console.log(err)
            }
        })
                console.log(curr.userId, this.userId)


        //update current highest max auto bidder
        if (currMax < amount) {
            MaxBids.update({ auctionId }, {$set: {amount, userId: this.userId}})
        }
        else if (currMax == amount) {
            MaxBids.remove({ auctionId, userId: curr.userId })
        }
        //make available bids part of recursion, and make sure that the winner has last bid
        function makeBids(currBids = [], otherTurn=false, typeIndex = 0) {
            const start = currHigh.amount
            const sorted = [currMax, amount].sort((a, b) => a - b)
            // const max = sorted[1]
            const low = sorted[0]
            const high = sorted[1]
            const value = BidTypes[typeIndex]
            //ensures that the higher maxBidder always winds up overbidding, if
            //the loser max bidder winds up making the highest possible bid within
            //his allowance, and the higher maxBidder has to go above losers
            //allowance to stay on top
            if ((value <= low && value > start) || (low == amount && otherTurn)) {
                // if (!currBids.length && otherTurn) {
                //     currBids.push({ auctionId, amount: value, userId: thisUserId })
                //     return makeBids(currBids, true)
                // }
                // else {
                    const lastIndex = currBids.length - 1
                    const nextBid = value
                    const current = { auctionId, amount: nextBid, userId: thisUserId }
                    const other = { auctionId, amount: nextBid, userId: curr.userId }
                    console.log(thisUserId, curr.userId)
                    if (otherTurn) {
                        if (nextBid > curr.amount) {
                            return currBids
                        }
                        currBids.push(other)
                        return makeBids(currBids, false, typeIndex+1)
                    }
                    else {
                        if (nextBid > amount) {
                            return currBids
                        }
                        currBids.push(current)
                        return makeBids(currBids, true,  typeIndex+1)
                    }
                // }
            } else if (value <= start) {
                return makeBids(currBids, otherTurn, typeIndex+1)
            } else {
                return currBids
            }
        }

        // function findAppropriateBidTypes() {
        //     // const nextBid = BidTypes[BidTypes.findIndex(currHigh.amount)+1]
        //     const start = currHigh.amount
        //     const sorted = [currMax, amount].sort((a, b) => a - b)
        //     // const max = sorted[1]
        //     const low = sorted[0]
        //     return function(x) {
        //         return x <= low && x > start
        //     }
        // }
    }
})
