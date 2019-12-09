import { Meteor } from 'meteor/meteor';
import { Auctions, AuctionTypes, BidTypeIndexes, BidTypes, ImagesFiles } from '../cols.js'
import { Jobs } from 'meteor/msavin:sjobs'
import dayjs from 'dayjs'

Meteor.methods({
  'auctions.insert' ({ imageIds, title, type: typeText, minimum, description, startDate }) {
    if (!this.userId) throw new Meteor.Error('not logged in')
    const type = typeText * 1

    if ([0, 1, 2].indexOf(type) == -1) throw new Meteor.Error("Error")
    const document = {
      title,
      type,
      minimum,
      typeName: AuctionTypes[type],
      createdAt: new Date(),
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
    ImagesFiles.update({ _id: { $in: imageIds } }, {$set:{ meta: { auctionId: auctionId }} })

    //make sure that biding start at the corresponding auction type
    if (type != 0) {
      const typeIndex = BidTypeIndexes[type] - 1
      const amount = BidTypes[typeIndex]
      Meteor.call('bids.insert', { index: typeIndex, auctionId, amount, show: false })
    }
    
    if (startDate) {
      Jobs.run("activateAuction", auctionId, {
        date: dayjs(startDate).toDate()
      });
    }

    Jobs.run("deactivateAuction", auctionId, {
      date: dayjs(startDate ? startDate : new Date()).add(3, 'day').toDate()
    });
    return auctionId
  },
  "auctions.remove.all" () {
    Auctions.remove({})
  }
})
