import './auctionList.html';
// import './createAuction.html';
import {Auctions} from '../../../api/cols.js'

Template.auctionList.onCreated(function () {
  Meteor.subscribe('auctions.all');
});

Template.auctionList.helpers({
  auctions(){
    console.log(Auctions.find().fetch())
      return Auctions.find({active: true})
  }
});