import { ImagesFiles } from '/imports/api/cols.js';
import './imageShow.html'
Template.imageShow.onCreated(function(){
    Meteor.subscribe('images.all')
})

Template.imageShow.helpers({
  images(){
    return ImagesFiles.findOne(this+"")
  },
})
