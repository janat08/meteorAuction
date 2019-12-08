// All links-related publications

import { Meteor } from 'meteor/meteor';
import { ImagesFiles } from '../images.js';

Meteor.publish('images.all', function () {
  return ImagesFiles.find().cursor
});
