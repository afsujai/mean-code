'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Types = mongoose.model('Types'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Types already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a type
 */
exports.create = function(req, res) {
	var type = new Types(req.body);
	type.name = req.name;
  type.schema = req.schema;
  type.parentid = req.parentid;

	type.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(type);
		}
	});
};

/**
 * Show the current type
 */
exports.read = function(req, res) {
	res.jsonp(req.type);
};

/**
 * Update a type
 */
exports.update = function(req, res) {
	var type = req.type;

	type = _.extend(type, req.body);

	type.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(type);
		}
	});
};

/**
 * Delete a type
 */
exports.delete = function(req, res) {
	var type = req.type;

	type.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(type);
		}
	});
};

/**
 * List of Types
 */
exports.list = function(req, res) {
	Types.find().sort('-typename').populate('typename', 'schema').exec(function(err, types) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(types);
		}
	});
};

/**
 * Types middleware
 */
exports.typeByID = function(req, res, next, id) {
	Types.findById(id).populate('typename', 'schema').exec(function(err, type) {
		if (err) return next(err);
		if (!type) return next(new Error('Failed to load type ' + id));
		req.type = type;
		next();
	});
};

/**
 * Types middleware
 */
exports.typeByParentID = function(req, res, next, id) {
  Types.findById(parentid).populate('typename', 'schema').exec(function(err, type) {
    if (err) return next(err);
    if (!type) return next(new Error('Failed to load type ' + id));
    req.type = type;
    next();
  });
};
