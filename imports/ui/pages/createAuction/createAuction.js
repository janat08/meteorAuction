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
console.log('submitting')
    const target = event.target;
    const {
      title: { value: tV }, 
    // date: { value: dateV }, 
    // hour: { value: hourV }, 
    // minute: { value: minuteV}, 
    description: { value: dV }, type: { value: typeV }, minimum: { value: mV }} = target
    // const date = dayjs(dateV+ " "+ hourV+":"+minuteV)
    // console.log(date.hour(hourV).minute(minuteV).toString(), dateV+ " "+ hourV+":"+minuteV)
    // if (!date.isValid() || true){
    //   console.log('invalid date')
    //   return
    // }
    
    //compare times
    // if (templ.time.isSame(dayjs()))
    console.log('submitting')

    Meteor.call('auctions.insert', {title: tV, type: typeV, minimum: mV, description: dV}, (err, res)=>{
console.log('submitting')
        if (err){
          console.log(err)
        } else {
                  FlowRouter.go('App.auction', {auctionId: res})
        }
      });
  },
});