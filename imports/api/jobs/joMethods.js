//activate deactivateauction
import { Jobs } from 'meteor/msavin:sjobs'
import { Auctions, Bids } from '../cols.js'

Jobs.register({
    "activateAuction": function (id) {
        console.log(id, 'running activate')
        Auctions.update(id, {$set: {active: true}})
        this.remove()
    },
    "deactivateAuction": function (id) {
        console.log('running deactivate')
        const auction = Auctions.findOne(id)
        const winner = Bids.findOne({auctionId: id}, {sort: {amount: -1}})
        Auctions.update(id, {$set: {active: false, finished: true, winner: winner.userId, winnerAmount: winner.amount}})
        this.remove()
    }
});