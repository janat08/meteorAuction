import { Meteor } from 'meteor/meteor';
import { Bids } from '../../cols.js';

Meteor.publish('bids.all', function () {
  return Bids.find({})
});
