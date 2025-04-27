const mongoose = require('mongoose');
const { toJSON, paginate, softDelete } = require('./plugins/index.js');

const projectSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    metaData: {
      type: Object,
      default: {
        fileCount: 0,
        lastEdited: null,
      },
    },
  },
  { timestamps: true },
);

projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);
projectSchema.plugin(softDelete);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
