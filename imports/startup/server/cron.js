import { Jobs } from 'meteor/msavin:sjobs'
import { ImagesFiles } from '../../api/cols.js'
Jobs.register({
    "clearImages": function () {
        const removed = ImagesFiles.remove({'meta.auctionId': null})
        this.replicate({in: {days: 1}})
        this.remove()
        console.log(typeof removed, "removed")
    }
});

Meteor.startup(function(){
  Jobs.run("clearImages", {
        singular: true
    })   
})   