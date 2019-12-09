import './createAuction.html';

import { Auctions, AuctionTypes } from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

// import 'gijgo'
//import './ginjgo.css'
// import flatpickr from "flatpickr";
//import './flatpicker.js'
//gijgo freezes with recursive calls
//flatpickr won't import styles, if styles imported manually nothing shows up
Template.createAuction.onCreated(function() {

});
Template.createAuction.onRendered(function() {

})

Template.createAuction.helpers({
  types() {
    return AuctionTypes;
  },
  dateTime() {
    const time = dayjs()
    Template.instance().time = time
    return { hour: time.format('HH'), date: time.format('DD MM YYYY'), minute: time.format('mm') }
  }
});

Template.createAuction.events({
  'submit #createAuction' (event, templ) {
    event.preventDefault();
    const target = event.target;
    const {
      title: { value: tV },
      date: { value: dateV },
      hour: { value: hourV },
      minute: { value: minuteV },
      description: { value: dV },
      type: { value: typeV },
      minimum: { value: mV }
    } = target
    var date = dayjs(dateV, 'DD MM YYYY').hour(hourV).minute(minuteV)

    if (!date.isValid()) {
      alert('invalid date, format (30 12 2019, hours 0-23 (15 is 3 pm)')
      return
    }
    console.log(date)
    var document = {title: tV, type: typeV, minimum: mV, description: dV }
    
    //if time is unchanged then don't set startDate
    if (!templ.time.isSame(date) && date.isAfter(dayjs())) {
       document.startDate = date.unix()
    }
    
      Meteor.call('auctions.insert', document , (err, res) => {
        if (err) {
          alert(err)
        }
        else {
          return
          FlowRouter.go('App.auction', { auctionId: res })
        }
      });
    
  },
});
