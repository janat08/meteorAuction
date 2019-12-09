import './createAuction.html';

import { Auctions, AuctionTypes, ImagesFiles } from '../../../api/cols.js'
import { FlowRouter } from 'meteor/kadira:flow-router';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

// import 'gijgo'
//import './ginjgo.css'
// import flatpickr from "flatpickr";
//import './flatpicker.js'
//gijgo freezes with recursive calls
//flatpickr won't import styles, if styles imported manually nothing shows up

Template.createAuction.onCreated(function() {
  this.currentUpload = new ReactiveArray()
  //meant to cause reactivity on object updates in current upload
  this.insertedUploads = new ReactiveVar(0)
  //used to assign ids to files, so that there're unique ids between consequtive upload batches
  this.numberOfRuns = 0
});
Template.createAuction.onRendered(function() {
$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})
})

Template.createAuction.helpers({
  types() {
    return AuctionTypes;
  },
  currentUpload() {
    //meant for object reactivity
    Template.instance().insertedUploads.get()
    const curUpload = Template.instance().currentUpload.list()
    const ids = curUpload.filter(x => x.doc).map(x => x.doc._id)
    const query = [{ _id: { $in: ids } }]
    return ImagesFiles.find({ $or: query }).each().concat(curUpload.filter(x => !x.doc));
  },
  dateTime() {
    const time = dayjs()
    Template.instance().time = time
    return { hour: time.format('HH'), date: time.format('DD MM YYYY'), minute: time.format('mm') }
  }
});

Template.createAuction.events({
  'submit #createAuction' (event, templ) {
    event.preventDefault();
    const target = event.target;
    const {
      title: { value: tV },
      date: { value: dateV },
      hour: { value: hourV },
      minute: { value: minuteV },
      description: { value: dV },
      type: { value: typeV },
      minimum: { value: mV }
    } = target
    var date = dayjs(dateV, 'DD MM YYYY').hour(hourV).minute(minuteV)

    if (!date.isValid()) {
      alert('invalid date, format (30 12 2019, hours 0-23 (15 is 3 pm)')
      return
    }

    const images = templ.currentUpload

    var document = {
      imageIds: images.map(x => x.doc._id),
      title: tV,
      type: typeV,
      minimum: mV * 1,
      description: dV
    }

    //if time is unchanged then don't set startDate
    if (!templ.time.isSame(date) && date.isAfter(dayjs())) {
      document.startDate = date.toDate()
    }

    Meteor.call('auctions.insert', document, (err, res) => {
      if (err) {
        alert(err)
      }
      else {
        FlowRouter.go('App.auction', { auctionId: res })
      }
    });
  },
  'click .jsRemovePic' (e, templ) {
    console.log(this)
    Meteor.call('images.remove', this._id)
    const st = templ.currentUpload
    st.splice(st.findIndex(x => x.doc._id == this._id), 1)
  },
  'change #fileInput' (e, template) {
    console.log(e.currentTarget.files)
    const uploadPush = template.currentUpload.push
    const st = template.currentUpload
    const stRuns = template.numberOfRuns + ""
    template.numberOfRuns += 1
    window.ab = template.currentUpload
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      Array.from(e.currentTarget.files).forEach((x, i) => {
        // We upload only one file, in case
        // multiple files were selected
        const upload = ImagesFiles.insert({
          file: e.currentTarget.files[i],
          streams: 'dynamic',
          chunkSize: 'dynamic',
          meta: {
            uploader: Meteor.userId(),
          },
        }, false);

        const itemId = stRuns + i

        upload.on('start', function() {
          st.push({ upload: this, _id: itemId })
        });

        upload.on('end', function(error, fileObj) {
          if (error) {
            alert('Error during upload: ' + error);
          }
          else {
            // alert('File "' + fileObj.name + '" successfully uploaded');
          }
          st[st.findIndex(x => x._id == itemId)].doc = fileObj
          template.insertedUploads.set(stRuns + i)
        });

        upload.start();
      })

    }
  },
});
