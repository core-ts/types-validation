"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resources = (function () {
  function resources() {
  }
  return resources;
}());
exports.resources = resources;
function isStrings(s) {
  if (!s || s.length === 0) {
    return true;
  }
  for (var _i = 0, s_1 = s; _i < s_1.length; _i++) {
    var x = s_1[_i];
    if (typeof x !== 'string') {
      return false;
    }
  }
  return true;
}
exports.isStrings = isStrings;
function isDates(s) {
  if (!s || s.length === 0) {
    return true;
  }
  for (var _i = 0, s_2 = s; _i < s_2.length; _i++) {
    var x = s_2[_i];
    if (!(x instanceof Date)) {
      return false;
    }
  }
  return true;
}
exports.isDates = isDates;
function isNumbers(s) {
  if (!s || s.length === 0) {
    return true;
  }
  for (var _i = 0, s_3 = s; _i < s_3.length; _i++) {
    var x = s_3[_i];
    if (typeof x !== 'number') {
      return false;
    }
  }
  return true;
}
exports.isNumbers = isNumbers;
function isIntegers(s) {
  if (!s || s.length === 0) {
    return true;
  }
  for (var _i = 0, s_4 = s; _i < s_4.length; _i++) {
    var x = s_4[_i];
    if (Number.isInteger(x)) {
      return false;
    }
  }
  return true;
}
exports.isIntegers = isIntegers;
function createError(path, name, code) {
  var x = name;
  if (path && path.length > 0) {
    x = path + '.' + name;
  }
  if (!code) {
    code = 'string';
  }
  var error = {
    field: x,
    code: code
  };
  return error;
}
var _datereg = '/Date(';
var _re = /-?\d+/;
function toDate(v) {
  if (!v) {
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
    if (m !== null) {
      var d = parseInt(m[0], 10);
      return new Date(d);
    }
    else {
      return null;
    }
  }
  else {
    if (isNaN(v)) {
      return new Date(v);
    }
    else {
      var d = parseInt(v, 10);
      return new Date(d);
    }
  }
}
function validateObject(obj, attributes, errors, path, allowUndefined, patch) {
  var keys = Object.keys(obj);
  var count = 0;
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    count = count + 1;
    var attr = attributes[key];
    if (!attr) {
      if (!allowUndefined) {
        errors.push(createError(path, key, 'undefined'));
        return;
      }
    }
    else {
      attr.name = key;
      var na = attr.name;
      var v = obj[na];
      if (v !== null) {
        var t = typeof v;
        var at = attr.type;
        switch (t) {
          case 'string':
            if (!(at === undefined || at === 'string' || at === 'text')) {
              errors.push(createError(path, na, at));
              return;
            }
            break;
          case 'number':
            if (attr.type === 'integer') {
              if (!Number.isInteger(v)) {
                errors.push(createError(path, na, 'integer'));
                return;
              }
            }
            else if (attr.type !== 'number') {
              errors.push(createError(path, na, 'number'));
              return;
            }
            break;
          case 'boolean':
            if (at !== 'boolean') {
              errors.push(createError(path, na, at));
              return;
            }
            break;
          case 'object':
            if (Array.isArray(v)) {
              switch (attr.type) {
                case 'strings': {
                  if (!isStrings(v)) {
                    errors.push(createError(path, na, 'strings'));
                    return;
                  }
                  break;
                }
                case 'numbers': {
                  if (!isNumbers(v)) {
                    errors.push(createError(path, na, 'numbers'));
                    return;
                  }
                  break;
                }
                case 'integers': {
                  if (!isIntegers(v)) {
                    errors.push(createError(path, na, 'integers'));
                    return;
                  }
                  break;
                }
                case 'datetimes': {
                  if (!isDates(v)) {
                    errors.push(createError(path, na, 'datetimes'));
                    return;
                  }
                  break;
                }
                case 'dates': {
                  if (resources.ignoreDate) {
                    if (!isDates(v)) {
                      errors.push(createError(path, na, 'dates'));
                      return;
                    }
                  }
                  break;
                }
                case 'array': {
                  for (var i = 0; i < v.length; i++) {
                    if (typeof v !== 'object') {
                      var y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                      errors.push(createError('', y, 'object'));
                      return;
                    }
                    else if (attr.typeof) {
                      var y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                      validateObject(v[i], attr.typeof, errors, y);
                      if (errors.length > 0) {
                        return;
                      }
                    }
                  }
                  break;
                }
                case 'primitives': {
                  if (typeof v !== 'object') {
                    errors.push(createError(path, na, 'array'));
                    return;
                  }
                  else {
                    if (!Array.isArray(v)) {
                      errors.push(createError(path, na, 'array'));
                      return;
                    }
                    else {
                      if (attr.code) {
                        if (attr.code === 'date') {
                          for (var i = 0; i < v.length; i++) {
                            if (v[i]) {
                              var date3 = toDate(v);
                              if (date3) {
                                var error3 = date3.toString();
                                if (!(date3 instanceof Date) || error3 === 'Invalid Date') {
                                  var y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                                  var err = createError('', y, 'date');
                                  errors.push(err);
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
                              var err = createError('', y, attr.code);
                              errors.push(err);
                              return;
                            }
                          }
                        }
                      }
                    }
                  }
                  break;
                }
                case 'times':
                  break;
                default:
                  errors.push(createError(path, na, at));
                  return;
              }
            }
            else {
              switch (attr.type) {
                case 'datetime':
                  var date = toDate(v);
                  if (date) {
                    var error = date.toString();
                    if (!(date instanceof Date) || error === 'Invalid Date') {
                      errors.push(createError(path, na, 'date'));
                      return;
                    }
                    else {
                      if (!(v instanceof Date)) {
                        obj[na] = date;
                      }
                    }
                  }
                  break;
                case 'date': {
                  if (resources.ignoreDate) {
                    var date2 = toDate(v);
                    if (date2) {
                      var error2 = date2.toString();
                      if (!(date2 instanceof Date) || error2 === 'Invalid Date') {
                        errors.push(createError(path, na, 'date'));
                        return;
                      }
                      else {
                        if (!(v instanceof Date)) {
                          obj[na] = date;
                        }
                      }
                    }
                  }
                  break;
                }
                case 'object': {
                  if (typeof v !== 'object') {
                    errors.push(createError(path, na, 'object'));
                    return;
                  }
                  else {
                    if (Array.isArray(v)) {
                      errors.push(createError(path, na, 'object'));
                      return;
                    }
                    else if (attr.typeof) {
                      var x = (path != null && path.length > 0 ? path + '.' + key : key);
                      validateObject(v, attr.typeof, errors, x);
                      if (errors.length > 0) {
                        return;
                      }
                    }
                  }
                  break;
                }
                default: {
                  break;
                }
              }
            }
            break;
          default:
            break;
        }
      }
    }
  }
  if (patch) {
    return;
  }
  var aks = Object.keys(attributes);
  if (!allowUndefined) {
    if (count >= aks.length) {
      return;
    }
  }
}
function validate(obj, attributes, allowUndefined, patch) {
  var errors = [];
  var path = '';
  validateObject(obj, attributes, errors, path, allowUndefined, patch);
  return errors;
}
exports.validate = validate;
exports.check = validate;
