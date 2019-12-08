import './auction.html';

import {Auctions, Bids, BidTypes} from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.auction.onCreated(function () {
  Meteor.subscribe('auctions.all');
  Meteor.subscribe('bids.all')
  this.bidType = new ReactiveVar(0)
});

Template.auction.helpers({
  auction() {
    const res = Auctions.findOne(FlowRouter.getParam("auctionId"))

    return res;
  },
  bid(){
    const {_id} = this
    const bids = Bids.find({}, {sort: {date: -1}}).fetch()
    const templ = Template.instance()
    templ.bidType.set(bids[0])
    return bids
  }
});

Template.auction.events({
  'click .bid'(event) {
    Meteor.call('bid', )
    console.log('bidding')
  },
});