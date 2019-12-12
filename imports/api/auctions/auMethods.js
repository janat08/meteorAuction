import { Meteor } from 'meteor/meteor';
import { Auctions, Bids, AuctionTypes, BidTypeIndexes, BidTypes, ImagesFiles } from '../cols.js'
// import { Jobs, JobsInternal } from 'meteor/msavin:sjobs'
// import { agenda } from '../jobs/joMethods.js'
import moment from 'moment'

SyncedCron.start();

Meteor.methods({
  'auctions.insert': async function({ imageIds, title, type: typeText, minimum, description, startDate }) {
    if (!this.userId) throw new Meteor.Error('not logged in')
    const type = typeText * 1

    if ([0, 1, 2].indexOf(type) == -1) throw new Meteor.Error("Error")
    const document = {
      title,
      type,
      minimum,
      typeName: AuctionTypes[type],
      createdAt: new Date(),
      endDate: moment(startDate ? startDate : new Date()).add(3, 'minutes').toDate(),
      description,
      imageIds,
    }

    if (startDate) {
      Object.assign(document, {
        startDate: startDate,
        active: false
      })
    }
    else {
      document.active = true
    }
    const auctionId = Auctions.insert(document);
    ImagesFiles.update({ _id: { $in: imageIds } }, { $set: { meta: { auctionId: auctionId } } })

    //make sure that biding start at the corresponding auction type
    if (type != 0) {
      const typeIndex = BidTypeIndexes[type] - 1
      const amount = BidTypes[typeIndex]
      Meteor.call('bids.insert', { index: typeIndex, auctionId, amount, show: false })
    }

    if (startDate) {
      // Jobs.run("activateAuction", auctionId, {
      //   date: moment(startDate).toDate()
      // });
      SyncedCron.add({
        name: 'activate auction',
        schedule: function(parser) {
          // parser is a later.parse object
          return parser.recur().on(startDate).fullDate()
        },
        job: function() {
          Auctions.update(auctionId, { $set: { active: true } })
        }
      });
      // agenda.schedule(moment(startDate).toDate(), 'activateAuction', { id: auctionId })
    }
    // const res = await agenda.schedule(moment(startDate ? startDate : new Date()).add(1, 'minute').toDate(), 'deactivateAuction', {id: auctionId})
    // const res = await agenda.schedule(new Date(), 'deactivateAuction', {id: auctionId})
    // const res = await agenda.now('deactivateAuction', { id: auctionId })



    SyncedCron.add({
      name: 'deactivate auction',
      schedule: function(parser) {
        // parser is a later.parse object
        return parser.recur().on(moment(startDate ? startDate : new Date()).add(1, 'minute').toDate()).fullDate() 
      },
      job: function() {
        const winner = Bids.findOne({ auctionId, show: true }, { sort: { amount: -1 } })
        Auctions.update(auctionId, { $set: { active: false, finished: true, winner: winner && winner.userId, winnerAmount: winner.amount } })
      }
    });
    // Jobs.run("deactivateAuction", auctionId, {
    //   date: moment(startDate ? startDate : new Date()).add(3, 'day').toDate()
    // });

    return auctionId
  },
  "auctions.remove.all" () {
    Auctions.remove({})
  }
})
// console.log(Object.keys(JobsInternal), JobsInternal.Utilities.helpers.getJob('deactivateAuction'))
