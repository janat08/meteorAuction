import { Meteor } from 'meteor/meteor';
import {Auctions} from '../cols.js'
Meteor.methods({
    'auctions.insert'({title, type}) {
    check(type, Number);
    check(title, String);
    if ([1,2,3].indexOf(type) == -1) throw new Meteor.Error()
    return Links.insert({
      url,
      title,
      createdAt: new Date(),
    });
  },
})