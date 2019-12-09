import { Mongo } from 'meteor/mongo';

export const MaxBids = new Mongo.Collection('maxBids');

if (Meteor.isServer){
    //so that people can't make two conflicting bids
    MaxBids._ensureIndex({auctionId: 1}, {unique: 1});   
}