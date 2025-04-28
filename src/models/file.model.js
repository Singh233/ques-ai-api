const mongoose = require('mongoose');
const { toJSON, paginate, softDelete } = require('./plugins/index.js');

const fileSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    transcript: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

fileSchema.plugin(toJSON);
fileSchema.plugin(paginate);
fileSchema.plugin(softDelete);

const File = mongoose.model('File', fileSchema);

module.exports = File;
