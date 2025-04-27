const catchAsync = require('./catchAsync.js');
const ApiError = require('./ApiError.js');
const httpStatus = require('http-status');

const generateCrud = (Model, options = {}) => {
  const { name = '', searchableFields = '', populate = '', functions = [] } = options;

  const searchableFieldsArray = searchableFields.split(',').map((field) => field.trim());
  const handlers = {};

  if (functions.includes('getAll')) {
    handlers.getAll = catchAsync(async (req, res) => {
      const options = {
        sortBy: req.query.sortBy,
        limit: req.query.limit,
        page: req.query.page,
        populate: req.query.populate,
      };

      const filter = { ...req.query };
      ['sortBy', 'limit', 'page', 'populate'].forEach((key) => delete filter[key]);

      let result;

      if (Model.paginate) {
        result = await Model.paginate(filter, options);
      } else {
        result = await Model.find(filter, null, options);
      }
      res.status(httpStatus.OK).json(result);
    });
  }

  if (functions.includes('getOne')) {
    handlers.getOne = catchAsync(async (req, res) => {
      const item = await Model.findById(req.params.id).populate(populate);
      if (!item) throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
      res.status(httpStatus.OK).json(item);
    });
  }

  if (functions.includes('create')) {
    handlers.create = catchAsync(async (req, res) => {
      const newItem = new Model(req.body);
      await newItem.save();
      res.status(httpStatus.CREATED).json(newItem);
    });
  }

  if (functions.includes('update')) {
    handlers.update = catchAsync(async (req, res) => {
      const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedItem) throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
      res.status(httpStatus.OK).json(updatedItem);
    });
  }

  if (functions.includes('softDelete')) {
    handlers.softDelete = catchAsync(async (req, res) => {
      const deletedItem = await Model.softDelete({ _id: req.params.id });
      if (!deletedItem) throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
      res.status(httpStatus.OK).json({ message: `${name} deleted successfully` });
    });
  }

  if (functions.includes('permanentDelete')) {
    handlers.permanentDelete = catchAsync(async (req, res) => {
      const deletedItem = await Model.findByIdAndDelete(req.params.id);
      if (!deletedItem) throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
      res.status(httpStatus.OK).json({ message: `${name} deleted successfully` });
    });
  }

  if (functions.includes('search')) {
    handlers.search = catchAsync(async (req, res) => {
      const searchQuery = req.params.searchQuery;

      let searchResults = [];

      if (Model.paginate) {
        searchResults = await Model.paginate(
          { $or: searchableFieldsArray.map((field) => ({ [field]: new RegExp(searchQuery, 'i') })) },
          {
            sortBy: req.query.sortBy,
            limit: req.query.limit,
            page: req.query.page,
            populate: req.query.populate,
          },
        );
      } else {
        searchResults = await Model.find(
          { $or: searchableFieldsArray.map((field) => ({ [field]: new RegExp(searchQuery, 'i') })) },
          null,
          {
            sortBy: req.query.sortBy,
            limit: req.query.limit,
            page: req.query.page,
            populate: req.query.populate,
          },
        );
      }

      res.status(httpStatus.OK).json(searchResults);
    });
  }

  return handlers;
};

module.exports = generateCrud;
