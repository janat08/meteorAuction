import { Meteor } from 'meteor/meteor';
import { MaxBids } from '../../cols.js';

Meteor.publish('maxBids.all', function () {
  return MaxBids.find({}, {fields: {amount: 0}})
});
