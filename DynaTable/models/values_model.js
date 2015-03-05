'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ValuesSchema = new Schema({
  type: { type: Schema.Types.ObjectId, ref: 'Types' }
  value: { type: Types.schema, ref: 'Types' }
});
