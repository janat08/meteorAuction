import { Meteor } from 'meteor/meteor';
import { MaxBids, BidTypes, Bids } from '../cols.js'

Meteor.methods({
    'maxBids.upsert' ({ amount: textAnyAmount, auctionId }) {
        console.log(this.userId)
        if (!this.userId) throw new Meteor.Error("youre logged out")
        const anyAmount = textAnyAmount*1
        const curr = MaxBids.findOne({ auctionId })
        const currHigh = Bids.findOne({ auctionId }, { sort: { amount: -1 } })

        const amount = BidTypes[BidTypes.findIndex((x, i, a) => {
            if ((a.length-1) == i) {
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
        if (curr && curr.userId == this.userId){
            if (curr.amount == amount){
                console.log('throwing error')
                throw new Meteor.Error('same amount entered')
            } else {
                console.log('making same user update')
                return MaxBids.update({auctionId, userId: this.userId}, {$set: {amount}}, (err,res)=>{
                    if (err){
                        return Meteor.call('maxBids.upsert', {amount, auctionId})
                    } else {
                        if (res != 1){
                            return Meteor.call('maxBids.upsert', {amount, auctionId})
                        }
                    }
                })
            }
        }
        console.log("making max bid")
        if (!curr) {
            return MaxBids.insert({ auctionId, amount, userId: this.userId }, (err, id) => {
                if (err) {
                    return Meteor.call('maxBids.upsert', { amount, auctionId })
                } else {
                    return console.log('inserted', id)
                }
            })
        }
        console.log("didn't make max bid")
        const currMax = curr.amount
        
        //bidding war simulation
        const bidsAvailable = BidTypes.filter(findAppropriateBidTypes(amount))
                console.log('bidsAvailable', bidsAvailable)

        const bidsToMake = makeBids()
                        console.log(bidsToMake)

        console.log(bidsToMake)
        bidsToMake.forEach(x=>{
            console.log('making insert', x.amount)
            try {
            Meteor.call('bids.insert', x)
            } catch(err){
                
            }
        })
        
        //update current highest max auto bidder
        if (currMax < amount){
            MaxBids.update({amount, userId: this.userId, auctionId})
        } else if (currMax == amount && curr.userId != this.userId){
            MaxBids.remove({auctionId, userId: curr.userId})
        }

        function makeBids(currBids = [], otherTurn) {
            if (!currBids.length) {
                currBids.push({ auctionId, amount: bidsAvailable[0], userId: this.userId })
                return makeBids(currBids, true)
            }
            else {
                const lastIndex = currBids.length - 1
                const nextBid = bidsAvailable[lastIndex]
                const current = { auctionId, amount: nextBid, userId: this.userId }
                const other = { auctionId, amount: nextBid, userId: curr.userId }

                if (otherTurn) {
                    if (nextBid>curr.amount){
                        return currBids
                    }
                    currBids.push(other)
                    return makeBids(currBids, false)
                } else {
                    if (nextBid>amount){
                        return currBids
                    }
                    currBids.push(current)
                    return makeBids(currBids, true)           
                }
            }
        }

        function findAppropriateBidTypes() {
            // const nextBid = BidTypes[BidTypes.findIndex(currHigh.amount)+1]
            const nextBid = currHigh.amount
            const sorted = [currMax, amount].sort((a,b)=>a-b)
            const max = sorted[1]
            return function(x) {
                return x <= max && x > nextBid
            }
        }
    }
})
