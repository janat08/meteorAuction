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
    const endDate = moment(startDate ? startDate : new Date()).add(3, 'days').toDate()
    const document = {
      title,
      type,
      minimum,
      typeName: AuctionTypes[type],
      createdAt: new Date(),
      endDate,
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
      SyncedCron.add({
        name: 'activate auction'+auctionId,
        schedule: function(parser) {
          // parser is a later.parse object
          return parser.recur().on(startDate).fullDate()
        },
        job: function() {
          Auctions.update(auctionId, { $set: { active: true } })
        }
      });
    }

    SyncedCron.add({
      name: 'deactivate auction'+auctionId,
      schedule: function(parser) {
        // parser is a later.parse object
        return parser.recur().on(endDate).fullDate() 
      },
      job: function() {
        const winner = Bids.findOne({ auctionId, show: true }, { sort: { amount: -1 } })
        Auctions.update(auctionId, { $set: { active: false, finished: true, winner: winner && winner.userId, winnerAmount: winner && winner.amount } })
      }
    });

    return auctionId
  },
  "auctions.remove.all" () {
    Auctions.remove({})
  }
})
// console.log(Object.keys(JobsInternal), JobsInternal.Utilities.helpers.getJob('deactivateAuction'))
