// Definition of the links collection

import { Mongo } from 'meteor/mongo';
import { FilesCollection } from 'meteor/ostrio:files';

export const ImagesCollection = new Mongo.Collection('images')

export const ImagesFiles = new FilesCollection({collection: ImagesCollection});
