import './body.html';

Template.body.events({
    "click .all"(){
        Meteor.call('bids.remove.all')
        Meteor.call('auctions.remove.all')
    },
    "click .auctions"(){
        Meteor.call('auctions.remove.all')
    },
        "click .bids"(){
        Meteor.call('bids.remove.all')
    }
})