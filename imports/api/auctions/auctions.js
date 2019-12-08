import { Mongo } from 'meteor/mongo';

export const Auctions = new Mongo.Collection('auctions');

export const AuctionTypes = ["ordinary", "new-items", "lux-items"]