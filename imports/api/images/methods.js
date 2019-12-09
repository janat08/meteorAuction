// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ImagesFiles, Auctions } from '../cols.js';

Meteor.methods({
  'images.remove'(id) {
    check(id, String)
    const auctionId = ImagesFiles.findOne(id).meta.auctionId
    if (auctionId) Auctions.update(auctionId, { $pull: { imageIds: id } })
    return ImagesFiles.remove(id);
  },
});
