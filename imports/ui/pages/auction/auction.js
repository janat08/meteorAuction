import './auction.html';

import { Auctions, Bids, BidTypes } from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.auction.onCreated(function() {
  const auReady = Meteor.subscribe('auctions.all');
  const biReady = Meteor.subscribe('bids.all')
  this.bidType = new ReactiveVar(0)
  this.autorun(() => {
    const id = FlowRouter.getParam("auctionId")
    const auction = Auctions.findOne(id)
    if (auReady.ready() && biReady.ready()){
      const bids = Bids.find({auctionId: id}, { sort: { index: -1 } }).fetch()
      this.bidType.set(bids[0])
      console.log(bids)
    }
  })
});

Template.auction.helpers({
  auction() {
    const res = Auctions.findOne(FlowRouter.getParam("auctionId"))

    return res;
  },
  bids() {
    let res = Bids.find({ show: { $ne: false } })
    return res
  }
});

Template.auction.events({
  'click .bid' (event, templ) {
    const index = templ.bidType.get()+1
    const amount = BidTypes[index]
    Meteor.call('bids.insert', 
      { auctionId: FlowRouter.getParam("auctionId"),
      index,
      amount,
      })
    console.log('bidding')
  },
});
