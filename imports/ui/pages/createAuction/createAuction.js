import './createAuction.html';

import {Auctions, AuctionTypes} from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';
import dayjs from 'dayjs'
window.dayjs = dayjs
Template.createAuction.onCreated(function () {
  Meteor.subscribe('links.all');
});

Template.createAuction.helpers({
  types() {
    return AuctionTypes;
  },
  dateTime(){
    const time = dayjs()
    Template.instance().time = time
    return {hour: time.format('HH'), date: time.format('DD MM YYYY'), minute: time.format('mm')}
  }
});

Template.createAuction.events({
  'submit'(event, templ) {
    event.preventDefault();

    const target = event.target;
    const {title: { value: tV }, date: { value: dateV }, hour: { value: hourV }, minute: { value: minuteV}, description: { value: dV }, type: { value: typeV }, minimum: { value: mV }} = target
    const date = dayjs(dateV)
    console.log(date.toString(), dayjs(timeV).toString())
    if (!date.isValid() || true){
      console.log('invalid date')
      return
    }
    if (templ.time )
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