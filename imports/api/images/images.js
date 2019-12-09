// Definition of the links collection

import { Mongo } from 'meteor/mongo';
import { FilesCollection } from 'meteor/ostrio:files';

export const ImagesCollection = new Mongo.Collection('images')
var config = {
    collection: ImagesCollection
}
if (!Meteor.isProduction){
    Object.assign(config, {storagePath: "C:\shop_pix"})
}
export const ImagesFiles = new FilesCollection(config);
