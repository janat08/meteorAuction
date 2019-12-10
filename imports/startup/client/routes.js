import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/auctionList/auctionList.js'
import '../../ui/pages/auction/auction.js';
import '../../ui/pages/createAuction/createAuction.js';

import '../../ui/pages/not-found/not-found.js';

window.SubsCache = new SubsCache(5, 10);


// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.auctions',
  action() {
    BlazeLayout.render('App_body', { main: 'auctionList' });
  },
});

FlowRouter.route('/auctions', {
  name: 'App.auctions',
  action() {
    BlazeLayout.render('App_body', { main: 'auctionList' });
  },
});

FlowRouter.route('/create', {
  name: 'App.createAuction',
  action() {
    BlazeLayout.render('App_body', { main: 'createAuction' });
  },
});

FlowRouter.route('/auction/:auctionId', {
  name: 'App.auction',
  action() {
    BlazeLayout.render('App_body', { main: 'auction' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
