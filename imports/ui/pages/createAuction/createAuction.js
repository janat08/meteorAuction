import './createAuction.html';

import {Auctions, AuctionTypes} from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';
import dayjs from 'dayjs'

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
    const {title: { value: tV },description: { value: dV }, type: { value: typeV }, minimum: { value: mV }} = target

    Meteor.call('auctions.insert', {title: tV, type: typeV, minimum: mV, description: dV}, (err, res)=>{
        console.log(res)
        if (err){
          console.log(err)
        } else {
                  FlowRouter.go('App.auction', {auctionId: res})
        }
      });
  },
});