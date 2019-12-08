import { Meteor } from 'meteor/meteor';
import { Bids } from '../../cols.js';

Meteor.publish('bids.all', function () {
  return Bids.find({}, {sort: {index: 1, date: 1}})
});
