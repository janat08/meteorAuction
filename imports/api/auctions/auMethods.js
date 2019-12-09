import { Meteor } from 'meteor/meteor';
import { Auctions, AuctionTypes, BidTypeIndexes, BidTypes } from '../cols.js'
import { Jobs } from 'meteor/msavin:sjobs'
import dayjs from 'dayjs'
Meteor.methods({
  'auctions.insert' ({ title, type: typeText, minimum, description, startDate }) {
    if (!this.userId) throw new Meteor.Error('not logged in')
    const now = new Date()
    const type = typeText * 1

    if ([0, 1, 2].indexOf(type) == -1) throw new Meteor.Error("Error")
    const document = {
      title,
      type,
      minimum,
      typeName: AuctionTypes[type],
      createdAt: new Date(),
      description,
    }
    console.log(startDate)
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
    const modifier = 3 * 24 * 60 * 60 * 1000
    console.log('end', new Date(startDate), dayjs(startDate).toDate(), dayjs(startDate ? startDate : new Date()).add(3, 'day').toDate())
    Jobs.run("deactivateAuction", auctionId, {
      date: dayjs(startDate ? startDate : new Date()).add(3, 'day').toDate()
    });
    return auctionId
  },
  "auctions.remove.all" () {
    Auctions.remove({})
  }
})
