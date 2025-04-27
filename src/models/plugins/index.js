const paginate = require('./paginate.plugin.js');
const toJSON = require('./toJSON.plugin.js');
const cascadeDelete = require('./cascadeDelete.plugin.js');
const softDelete = require('./softDelete.plugin.js');

module.exports = { paginate, toJSON, cascadeDelete, softDelete };
