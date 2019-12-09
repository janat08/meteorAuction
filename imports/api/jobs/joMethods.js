//activate deactivateauction
import { Jobs } from 'meteor/msavin:sjobs'
import { Auctions } from '../cols.js'

Jobs.register({
    "activateAuction": function (id) {
        console.log(id, 'running activate')
        Auctions.update(id, {$set: {active: true}})
        this.remove()
    },
    "deactivateAuction": function (id) {
        console.log('running deactivate')
        Auctions.update(id, {$set: {active: false}})
        this.remove()
    }
});