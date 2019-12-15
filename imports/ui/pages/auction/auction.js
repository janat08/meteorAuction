import './auction.html';

import { Auctions, Bids, BidTypes, BidTypesObj } from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';
import humanize from 'humanize-duration'
import moment from 'moment'
import '../../components/imageShow/imageShow.js'

Template.auction.onCreated(function() {
  const auReady = SubsCache.subscribe('auctions.all');
  const biReady = SubsCache.subscribe('bids.all')
  SubsCache.subscribe('images.all')
  //correct base case, you're showing next bid, unlike ordinary auction type
  //others are create with base bid, so rest of the logic just increments the bid
  //to show next possible bid, in case of ordinary that becomes 0 (or the start)
  this.bidType = new ReactiveVar(-1)
  this.customBid = new ReactiveVar(0)
  this.timeTicker = new ReactiveVar(0)
  this.observerHandle = {stop: ()=>{}}


  //ticks for every minute
  const templ = this

  function ticker() {
    const now = moment()
    const inMinute = now.second(0).millisecond(0).add(1, 'm') - now
    clearTimeout(templ.timeOut)
    templ.timeOut = setTimeout(() => {
      templ.timeTicker.set(new Date())
      ticker()
    }, inMinute)
  }

  //responsible for showing modal
  this.autorun(() => {
    const cursor = Auctions.find(FlowRouter.getParam("auctionId"))
    this.observerHandle.stop()
    this.observerHandle = cursor.observeChanges({
      changed(id, fields) {
        if (fields.endDate){
          $('#endExtension').modal()
        }
        console.log(fields)
      }
    })
  })

  //responsible for updating/switching timer, and minimum bid
  this.autorun(() => {
    const id = FlowRouter.getParam("auctionId")
    console.log("ready", auReady.ready(), biReady.ready())
    if (auReady.ready() && biReady.ready()) {
      const auction = Auctions.findOne(id)
      const bids = Bids.findOne({ auctionId: id }, { sort: { amount: -1 } })
      if (bids) {
        this.bidType.set(BidTypesObj[bids.amount] * 1)
      }
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
    let res = Bids.find({ auctionId: this._id, show: { $ne: false }, }, { sort: { amount: -1 } }).map(x => {
      const date = moment(x.date)
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
    const end = this.endDate
    const now = moment()
    if (now.isAfter(end)) {
      return "EXPIRED"
    }
    if (startDate && now.isBefore(moment(startDate))) {
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
    const index = templ.customBid.get()
    const bidAmount = BidTypes[index]
    const amount = $('.maxBidJs').val()
    $('.maxBidJs').val("")
    if (amount == "" || amount == 0 || !amount) {
      alert('inter a value for max bid')
      return
    }
    const last = Bids.findOne({ show: { $ne: false } }, { sort: { amount: -1 } })
    Meteor.call('maxBids.upsert', { bidAmount, amount, auctionId: FlowRouter.getParam("auctionId") },
      (err, res) => {
        if (err) {
          alert(err.error)
        }
      })
  },
});

function makeBid(event, templ) {
  const index = templ.customBid.get()
  const amount = BidTypes[index]
  Meteor.call('bids.insert', {
    auctionId: FlowRouter.getParam("auctionId"),
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
  this.observerHandle.stop()
})
