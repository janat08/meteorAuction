import './createAuction.html';

import {Auctions, AuctionTypes} from '../../../api/cols.js'


Template.createAuction.onCreated(function () {
  Meteor.subscribe('links.all');
});

Template.createAuction.helpers({
  types() {
    return AuctionTypes;
  },
});

Template.createAuction.events({
  'submit'(event) {
    event.preventDefault();

    const target = event.target;
    const {title: { value: tV }, type: { value: typeV }, minimum: { value: mV }} = target

    Meteor.call('auctions.insert', {title: tV, type: typeV, minimum: mV}, (error) => {
      if (error) {
        alert(error.error);
      } else {

      }
    });
  },
});