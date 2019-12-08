import { Meteor } from 'meteor/meteor';
import { Auctions } from '../../cols.js';

Meteor.publish('auctions.all', function () {
  return Auctions.find()
});
