import { Meteor } from 'meteor/meteor';
import {Auctions, AuctionTypes} from '../cols.js'

Meteor.methods({
    'auctions.insert'({title, type, minimum}) {
      console.log([1,0].indexOf(0))
    if ([0,1,2].indexOf(type*1) == -1) throw new Meteor.Error("Error")
    return Auctions.insert({
      title,
      type,
      minimum,
      typeName: AuctionTypes[type],
      createdAt: new Date(),
    });
  },
})