import './auction.html';

import { Auctions, Bids, BidTypes, BidTypesObj } from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';
import dayjs from 'dayjs'
import humanize from 'humanize-duration'
import '../../components/imageShow/imageShow.js'

Template.auction.onCreated(function() {
  const auReady = Meteor.subscribe('auctions.all');
  const biReady = Meteor.subscribe('bids.all')
  //correct base case, you're showing next bid, unlike ordinary auction type
  //others are create with base bid, so rest of the logic just increments the bid
  //to show next possible bid, in case of ordinary that becomes 0 (or the start)
  this.bidType = new ReactiveVar(-1)
  this.customBid = new ReactiveVar(0)
  this.timeTicker = new ReactiveVar(0)

  //ticks for every minute
  const templ = this

  function ticker() {
    const now = dayjs()
    const inMinute = now.second(0).millisecond(0).add(1, 'm') - now
    clearTimeout(templ.timeOut)
    templ.timeOut = setTimeout(() => {
      templ.timeTicker.set(new Date())
      ticker()
    }, inMinute)
  }

  this.autorun(() => {
    const id = FlowRouter.getParam("auctionId")
    const auction = Auctions.findOne(id)
    if (auReady.ready() && biReady.ready()) {
      const bids = Bids.findOne({ auctionId: id }, { sort: { amount: -1 } })
      this.bidType.set(BidTypesObj[bids.amount] * 1)
      console.log(BidTypesObj[bids.amount], bids)
    }
    ticker()
  })
  this.autorun(() => {
    console.log("state", this.bidType.get(), this.customBid.get(), BidTypes[this.customBid.get()])
  })
});

Template.auction.helpers({
  auction() {
    const res = Auctions.findOne(FlowRouter.getParam("auctionId"))

    return res;
  },
  bids() {
    let res = Bids.find({ show: { $ne: false } }, { sort: { amount: -1 } }).map(x => {
      const date = dayjs(x.date)
      x.date = { date: date.format('D/M/YY'), time: date.format('hh:mm') }
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
    const { startDate, createdAt } = this
    const end = dayjs(this.createdAt).add(3, 'day')
    const now = dayjs()
    if (now.isAfter(end)) {
      return "EXPIRED"
    }
    if (startDate && now.isBefore(dayjs(startDate))) {
      return "Hasn't begun, starts in: " + humanize(startDate - now, { units: ['d', 'h', 'm'], round: true })
    }
    const diff = end - now
    return "Ends In " + humanize(diff, { units: ['d', 'h', 'm'], round: true })
  }
});

Template.auction.events({
  'change .customBidSelect' (event, templ) {
    templ.customBid.set(event.target.value)
  },
  'click .justBidJs': makeBid,
  'click .setMaxJs' (event, templ) {
    const last = Bids.findOne({ show: { $ne: false } }, { sort: { amount: -1 } })
    // if (last.userId != Meteor.userId){
    //       makeBid(event, templ)
    // }
    const amount = $('.maxBidJs').val()
    console.log(amount)
    Meteor.call('maxBids.upsert', {amount, auctionId: FlowRouter.getParam("auctionId")},
    (err, res)=>{
      if (err){
        alert(err.error)
      }
    })
  },
});

function makeBid(event, templ) {
  const index = templ.customBid.get()
  const amount = BidTypes[index]
  // const res = window.confirm("Would you like to bid for " + amount)
  Meteor.call('bids.insert', {
    auctionId: FlowRouter.getParam("auctionId"),
    index,
    amount,
  }, (err, res) => {
    if (err) {
      alert(err.error)
    }
    else {
      $('.customBidSelect').val(0)
    }
  })
}

Template.auction.onDestroyed(function() {
  clearTimeout(this.timeOut)
})
