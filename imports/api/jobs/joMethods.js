// //activate deactivateauction
// import { Jobs } from 'meteor/msavin:sjobs'
// import { Auctions, Bids } from '../cols.js'
// import Agenda from 'agenda'

// var agenda = new Agenda({ db: { address: process.env.MONGO_URL } })

// agenda.define('activateAuction', async function(job) {
//     const { id } = job.attrs.data;
//     await Auctions.update(id, { $set: { active: true } })
//     console.log('activating')
// })
// agenda.define('deactivateAuction', async function(job) {
//     const { id } = job.attrs.data;
//     const winner = await Bids.findOne({ auctionId: id, show: true }, { sort: { amount: -1 } })
//     await Auctions.update(id, { $set: { active: false, finished: true, winner: winner && winner.userId, winnerAmount: winner.amount } })
//     console.log('deactivating')
// })

// agenda.start()
// agenda.on('ready', async function() {
//   const a = await agenda.jobs({name: 'deactivateAuction'})
// console.log('jobs', new Date(), a.map(x=>x.attrs.nextRunAt))
// });



// // Jobs.register({
// //     "activateAuction": function(id) {
// //         console.log(id, 'running activate')
// //         Auctions.update(id, { $set: { active: true } })
// //         this.success()
// //         this.remove()
// //     },
// //     "deactivateAuction": function(id) {

// //         console.log('running deactivate')
// //         const auction = Auctions.findOne(id)
// //         const winner = Bids.findOne({ auctionId: id, show: true }, { sort: { amount: -1 } })
// //         Auctions.update(id, { $set: { active: false, finished: true, winner: winner && winner.userId, winnerAmount: winner.amount } })
// //         this.success()
// //         this.remove()
// //     },
// //     "sendReminder": function(to, message) {
// //         var instance = this;

// //         console.log('running shite whenever')

// //         instance.remove()
// //     }
// // });
// export { agenda }
