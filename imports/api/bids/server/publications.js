import { Meteor } from 'meteor/meteor';
import { Bids } from '../../cols.js';

Meteor.publish('bids.all', function () {
  return Bids.find({}, {sort: {index: 1, date: 1}}).filter((x,i,a)=>{
      return x.index == a[i-1].index? false: true
  })
});
