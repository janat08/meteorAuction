//activate deactivateauction
import { Jobs } from 'meteor/msavin:sjobs'
import { Auctions, Bids } from '../cols.js'
import moment from 'moment'
Jobs.register({
    "activateAuction": function (id) {
        console.log(id, 'running activate')
        Auctions.update(id, {$set: {active: true}})
        this.success()
        this.remove()
    },
    "deactivateAuction": function (id) {
        console.log('running deactivate')
        const auction = Auctions.findOne(id)
        const winner = Bids.findOne({auctionId: id, show: true}, {sort: {amount: -1}})
        Auctions.update(id, {$set: {active: false, finished: true, winner: winner && winner.userId, winnerAmount: winner.amount}})
        this.success()
        this.remove()
    },
     "sendReminder": function (to, message) {
        var instance = this;

        console.log('running shite whenever')

instance.remove()
    }
});

 agenda = new Agenda({db: {address: process.env.MONGO_URL}})

Meteor.startup(()=>{
    Jobs.run("sendReminder", "jony@apple.com", "The future is here!", {date: moment().add(4, 'minute').toDate()});
})
