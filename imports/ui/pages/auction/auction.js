import './auction.html';

import { Auctions, Bids, BidTypes } from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.auction.onCreated(function() {
  const auReady = Meteor.subscribe('auctions.all');
  const biReady = Meteor.subscribe('bids.all')
  this.bidType = new ReactiveVar(0)
  this.customBid = new ReactiveVar(0)
  this.autorun(() => {
    const id = FlowRouter.getParam("auctionId")
    const auction = Auctions.findOne(id)
    if (auReady.ready() && biReady.ready()){
      const bids = Bids.find({auctionId: id}, { sort: { index: -1 } }).fetch()
      this.bidType.set(bids[0].index*1)
      console.log(bids[0])
    }
  })
  this.autorun(()=>{
    console.log("state", this.bidType.get(), this.customBid.get(), BidTypes[this.customBid.get()])
  })
});

Template.auction.helpers({
  auction() {
    const res = Auctions.findOne(FlowRouter.getParam("auctionId"))

    return res;
  },
  bids() {
    let res = Bids.find({ show: { $ne: false } }, {sort: {amount: -1}})
    return res
  },
  nextBid(){
    return BidTypes[Template.instance().bidType.get()+1]
  },
  possibleBids(){
    const templ = Template.instance()
    const {bidType, customBid} = templ
    const res = BidTypes.map((x,i)=>{
      return {amount: x, index: i}
    }).slice(bidType.get()+1)
    customBid.set(res[0].index)
    $('.customBidSelect').val(0)

    return res
  },
  selectFieldValue(){
    return Template.instance().customBid.get()+""
  }
});

Template.auction.events({
  'change .customBidSelect'(event, templ){
    templ.customBid.set(event.target.value)
  },
  'click .customBidMake'(event,templ){
    const index = templ.customBid.get()
        const amount = BidTypes[index]
    console.log("custom", templ.customBid.get())
    Meteor.call('bids.insert', 
      { auctionId: FlowRouter.getParam("auctionId"),
      index,
      amount,
    }, (err,res)=>{
      if (err){
        alert("Another user made the same bid before you")
      } else {
        $('.customBidSelect').val(0)
      }
    })
  },
  'click .bidNext' (event, templ) {
    const index = templ.bidType.get()+1
    const amount = BidTypes[index]
    console.log(index, templ.bidType.get())
    Meteor.call('bids.insert', 
      { auctionId: FlowRouter.getParam("auctionId"),
      index,
      amount,
      })
    console.log('bidding')
  },
});
