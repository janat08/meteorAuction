import './productForm.html';
import { Products, Product, ImagesFiles } from '/imports/api/cols.js';
import { FlowRouter } from 'meteor/kadira:flow-router';


Template.productForm.onCreated(function() {
    this.currentUpload = new ReactiveArray()
    //meant to cause reactivity on object updates in current upload
    this.insertedUploads = new ReactiveVar(0) 
     //used to assign ids to files, so that there're unique ids between consequtive upload batches
    this.numberOfRuns = 0
    this.autorun(() => {
        const id = FlowRouter.getParam("productId")
        SubsCache.subscribe('images.all', id)
        if (id) {
            SubsCache.subscribe('products.one', id)
        }
    });
});

Template.productForm.helpers({
    currentUpload() {
        //meant for object reactivity
        Template.instance().insertedUploads.get()
        const curUpload = Template.instance().currentUpload.list()
        const ids = curUpload.filter(x=>x.doc).map(x=>x.doc._id)
        const pId = FlowRouter.getParam("productId")
        const query = [{_id: {$in: ids}}]
        if (pId) query.push({"meta.productId": pId})
        return ImagesFiles.find({$or: query}).each().concat(curUpload.filter(x=>!x.doc));
    },
    product() {
        const res = Products.findOne(FlowRouter.getParam("productId"))
        return res
    }
});

Template.productForm.events({
    'click .jsRemovePic' (e, templ){
        console.log(this)
        Meteor.call('images.remove', this._id)
        const st = templ.currentUpload
        st.splice(st.findIndex(x=>x.doc._id==this._id), 1)
    },
    'change #fileInput' (e, template) {
        console.log( e.currentTarget.files)
        const uploadPush = template.currentUpload.push
        const st = template.currentUpload
        const stRuns = template.numberOfRuns+""
        template.numberOfRuns+=1
        window.ab = template.currentUpload
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            Array.from(e.currentTarget.files).forEach((x,i)=>{
                                // We upload only one file, in case
                // multiple files were selected
                const upload = ImagesFiles.insert({
                    file: e.currentTarget.files[i],
                    streams: 'dynamic',
                    chunkSize: 'dynamic',
                    meta: {
                        uploader: Meteor.userId(),
                        productId: FlowRouter.getParam("productId"),
                    },
                }, false);
                
                const itemId = stRuns+i
                
                upload.on('start', function() {
                    st.push({upload: this, _id: itemId})
                });

                upload.on('end', function(error, fileObj) {
                    if (error) {
                        alert('Error during upload: ' + error);
                    }
                    else {
                        // alert('File "' + fileObj.name + '" successfully uploaded');
                    }
                    st[st.findIndex(x=>x._id==itemId)].doc = fileObj
                    template.insertedUploads.set(stRuns+i)
                    // inter[i-1].doc = fileObj
                    // st.set(inter)
                });

                upload.start();
            })

        }
    },
    'submit' (event, template) {
        event.preventDefault();
        const images = template.currentUpload
        console.log(images)
        const { title: { value: tV }, description: { value: dV }, price: { value: pV } } = event.target;
        Meteor.call('products.upsert', {imageIds: images.map(x=>x.doc._id), _id: FlowRouter.getParam("productId"), title: tV, description: dV, price: pV }, (error, res) => {
            if (error) {
                console.log(error)
                alert(error.error);
            }
            else {
                // const { title, description, price } = event.target;
                // title.value = '';
                // description.value = '';
                // price.value = ''
                console.log(res)
                FlowRouter.go('App.product', {productId: res})

            }
        })
    },
});
