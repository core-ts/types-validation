"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Type;
(function (Type) {
  Type["ObjectId"] = "ObjectId";
  Type["Date"] = "date";
  Type["Boolean"] = "boolean";
  Type["Number"] = "number";
  Type["Integer"] = "integer";
  Type["String"] = "string";
  Type["Object"] = "object";
  Type["Array"] = "array";
  Type["Primitives"] = "primitives";
  Type["Binary"] = "binary";
})(Type = exports.Type || (exports.Type = {}));
var _datereg = '/Date(';
var _re = /-?\d+/;
function toDate(v) {
  if (!v || v === '') {
    return null;
  }
  if (v instanceof Date) {
    return v;
  }
  else if (typeof v === 'number') {
    return new Date(v);
  }
  var i = v.indexOf(_datereg);
  if (i >= 0) {
    var m = _re.exec(v);
    var d = parseInt(m[0], null);
    return new Date(d);
  }
  else {
    if (isNaN(v)) {
      return new Date(v);
    }
    else {
      var d = parseInt(v, null);
      return new Date(d);
    }
  }
}
function createError(path, name, code) {
  var x = name;
  if (path && path.length > 0) {
    x = path + '.' + name;
  }
  var error = {
    field: x,
    code: code
  };
  return error;
}
function validateObject(obj, meta, errors, path, max, allowUndefined) {
  var keys = Object.keys(obj);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var attr = meta.attributes[key];
    if (!attr) {
      if (!allowUndefined) {
        errors.push(createError(path, key, 'undefined'));
      }
    }
    else {
      var na = attr.name;
      var v = obj[na];
      if (v) {
        switch (attr.type) {
          case Type.String: {
            if (typeof v !== 'string') {
              errors.push(createError(path, na, 'string'));
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case Type.Number:
          case Type.Integer: {
            if (typeof v !== 'number') {
              errors.push(createError(path, na, 'number'));
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case Type.Date: {
            var date = toDate(v);
            var error = date.toString();
            if (!(date instanceof Date) || error === 'Invalid Date') {
              errors.push(createError(path, na, 'date'));
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case Type.Boolean: {
            if ((typeof v === 'boolean') !== true) {
              errors.push(createError(path, na, 'boolean'));
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case Type.Object: {
            if (typeof v !== 'object') {
              errors.push(createError(path, na, 'object'));
            }
            else {
              if (Array.isArray(v)) {
                errors.push(createError(path, na, 'object'));
              }
              else {
                var x = (path != null && path.length > 0 ? path + '.' + key : key);
                validateObject(v, attr.typeof, errors, x);
              }
            }
            if (errors.length >= max) {
              return;
            }
            break;
          }
          case Type.Array: {
            if (typeof v !== 'object') {
              errors.push(createError(path, na, 'array'));
            }
            else {
              if (!Array.isArray(v)) {
                errors.push(createError(path, na, 'array'));
              }
              else {
                for (var i = 0; i < v.length; i++) {
                  if (typeof v !== 'object') {
                    var y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                    errors.push(createError('', y, 'object'));
                    if (errors.length >= max) {
                      return;
                    }
                  }
                  else {
                    var y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                    validateObject(v[i], attr.typeof, errors, y);
                  }
                }
              }
            }
            if (errors.length >= max) {
              return;
            }
            break;
          }
          case Type.Primitives: {
            if (typeof v !== 'object') {
              errors.push(createError(path, na, 'array'));
            }
            else {
              if (!Array.isArray(v)) {
                errors.push(createError(path, na, 'array'));
              }
              else {
                if (attr.code) {
                  if (attr.code === 'date') {
                    for (var i = 0; i < v.length; i++) {
                      if (v[i]) {
                        var date = toDate(v);
                        var error = date.toString();
                        if (!(date instanceof Date) || error === 'Invalid Date') {
                          var y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                          errors.push(createError('', y, 'date'));
                          if (errors.length >= max) {
                            return;
                          }
                        }
                      }
                    }
                  }
                  else {
                    for (var i = 0; i < v.length; i++) {
                      if (v[i] && typeof v[i] !== attr.code) {
                        var y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                        errors.push(createError('', y, attr.code));
                        if (errors.length >= max) {
                          return;
                        }
                      }
                    }
                  }
                }
              }
            }
            if (errors.length >= max) {
              return;
            }
            break;
          }
          default: {
            break;
          }
        }
      }
    }
  }
}
function validateTypes(obj, meta, max, allowUndefined) {
  var errors = [];
  var path = '';
  if (max == null) {
    validateObject(obj, meta, errors, path, undefined, allowUndefined);
  }
  else {
    validateObject(obj, meta, errors, path, max, allowUndefined);
  }
  return errors;
}
exports.validateTypes = validateTypes;
