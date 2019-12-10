import './auctionList.html';
import { Auctions, AuctionTypes } from '../../../api/cols.js'
import '../../components/imageShow/imageShow.js'

Template.auctionList.onCreated(function() {
  SubsCache.subscribe('auctions.all');
  SubsCache.subscribe('images.all')
  this.type = new ReactiveVar(0)
});

Template.auctionList.helpers({
  types() {
    return AuctionTypes;
  },
  auctions() {
    const type = Template.instance().type.get()
    return Auctions.find({ active: true, type }).fetch().map(x => {
      x.imageIds = x.imageIds.slice(0, 1)
      console.log(x)
      return x
    })
  }
});

Template.auctionList.events({
  'change .typeSelect'(event,templ){
    templ.type.set(event.target.value*1)
  }
});