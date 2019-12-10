import { Meteor } from 'meteor/meteor';
import { maxBids, BidTypes, Bids } from '../cols.js'

Meteor.methods({
    'maxBids.upsert' ({ amount: anyAmount, auctionId }) {
        const curr = maxBids.findOne({ auctionId })
        const amount = BidTypes.findIndex((x, i, a) => {
            if (i == 0) {
                return a[i + 1] > anyAmount
            }
            else if (a.length == i) {
                return true
            }
            else {
                return a[i - 1] <= anyAmount
            }
        })
        if (amount == -1) throw new Meteor.Error('amount is beneath minimum bidding')
        if (!curr) {
            return maxBids.insert({ auctionId, amount }, (err, id) => {
                if (err) {
                    Meteor.call('maxBids.upsert', { amount, auctionId })
                }
            })
        }
        const currHigh = Bids.findOne({ show: { $ne: false } }, { sort: { amount: -1 } })
        const currMax = curr.amount
        if (currHigh >= amount) {
            throw new Meteor.Error("Current highest bid is higher than your maximum value")
        }
        else {
            //MAKE RECURSIVE MAKE RECURSIVE
            if (currMax > amount) {
                const makeBids = BidTypes.filter(findAppropriateBidTypes(amount))
                Meteor.call('bids.insert', {amount: makeBids.slice(-1), auctionId, })
                auctionId, index, amount, show = true
            }
            else if (amount > currMax) {

            } else {
                
            }
        }

        function findAppropriateBidTypes(lowerMax) {
            return function(x) {
                return x > currHigh && lowerMax >= x
            }
        }
        maxBids.update()
    }
})

function makeBids (that, currHigh, currMax, amount){
                if (currMax > amount) {
                const makeBids = BidTypes.filter(findAppropriateBidTypes(amount))
                Meteor.call('bids.insert', {amount: makeBids.slice(-1), auctionId, })
                auctionId, index, amount, show = true
            }
            else if (amount > currMax) {

            } else {
                
            }
}