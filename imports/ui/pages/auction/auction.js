import './auction.html';

import { Auctions, Bids, BidTypes } from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';
import dayjs from 'dayjs'
import humanize from 'humanize-duration'

Template.auction.onCreated(function() {
  const auReady = Meteor.subscribe('auctions.all');
  const biReady = Meteor.subscribe('bids.all')
  this.bidType = new ReactiveVar(0)
  this.customBid = new ReactiveVar(0)
  this.timeTicker = new ReactiveVar(0)
  this.autorun(() => {
    const id = FlowRouter.getParam("auctionId")
    const auction = Auctions.findOne(id)
    if (auReady.ready() && biReady.ready()) {
      const bids = Bids.find({ auctionId: id }, { sort: { index: -1 } }).fetch()
      this.bidType.set(bids[0].index * 1)
      console.log(bids[0])
    }
  })
  this.autorun(() => {
    console.log("state", this.bidType.get(), this.customBid.get(), BidTypes[this.customBid.get()])
  })
  this.interval = setInterval(() => {
    this.timeTicker.set('')
  }, 60)
});

Template.auction.helpers({
  auction() {
    const res = Auctions.findOne(FlowRouter.getParam("auctionId"))

    return res;
  },
  bids() {
    let res = Bids.find({ show: { $ne: false } }, { sort: { amount: -1 } }).map(x=>{
          const date = dayjs(x.date)
          x.date = {date: date.format('D/M/YY'), time: date.format('hh:mm')}
          console.log(x.date)
          return x
    })
    return res
  },
  nextBid() {
    return BidTypes[Template.instance().bidType.get() + 1]
  },
  possibleBids() {
    const templ = Template.instance()
    const { bidType, customBid } = templ
    const res = BidTypes.map((x, i) => {
      return { amount: x, index: i }
    }).slice(bidType.get() + 1)
    customBid.set(res[0].index)
    $('.customBidSelect').val(0)

    return res
  },
  selectFieldValue() {
    return Template.instance().customBid.get() + ""
  },
  whenEnds() {
    Template.instance().timeTicker.get()
    const end = dayjs(this.createdAt).add(3, 'day')
    const now = dayjs()
    if (now.isAfter(end)){
      return "EXPIRED"
    }
    const diff = end - now
    return "Ends In " + humanize(diff, { units: ['d', 'h', 'm'], round: true })
  }
});

Template.auction.events({
  'change .customBidSelect' (event, templ) {
    templ.customBid.set(event.target.value)
  },
  'click .customBidMake' (event, templ) {
    const index = templ.customBid.get()
    const amount = BidTypes[index]
    const res = window.confirm("Would you like to bid for " + amount)
    if (res) {
      Meteor.call('bids.insert', {
        auctionId: FlowRouter.getParam("auctionId"),
        index,
        amount,
      }, (err, res) => {
        if (err) {
          alert("Another user made the same bid before you")
        }
        else {
          $('.customBidSelect').val(0)
        }
      })
    }

  },
});


Template.auction.onDestroyed(function() {
  clearInterval(this.interval)
})
