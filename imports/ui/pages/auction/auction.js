import './auction.html';

import {Auctions} from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.auction.onCreated(function () {
  Meteor.subscribe('auctions.all');
});

Template.auction.helpers({
  auction() {
    const res = Auctions.findOne(FlowRouter.getParam("auctionId"))

    return res;
  },
});

Template.auction.events({
  'submit .info-link-add'(event) {
    event.preventDefault();

    const target = event.target;
    const title = target.title;
    const url = target.url;

    Meteor.call('links.insert', title.value, url.value, (error) => {
      if (error) {
        alert(error.error);
      } else {
        title.value = '';
        url.value = '';
      }
    });
  },
});