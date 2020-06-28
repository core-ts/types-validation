export interface Attribute {
  name?: string;
  type: DataType;
  code?: string;
  typeof?: Metadata;
}

export enum DataType {
  ObjectId = 'ObjectId',
  Date = 'date',
  Boolean = 'boolean',

  Number = 'number',
  Integer = 'integer',
  String = 'string',

  Object = 'object',
  Array = 'array',
  Primitives =  'primitives',
  Binary = 'binary'
}

export interface Metadata {
  name: string;
  attributes: any;
}

export interface ErrorMessage {
  field: string;
  code: string;
}

const _datereg = '/Date(';
const _re = /-?\d+/;

export function toDate(dateStr: any) {
  if (dateStr instanceof Date) {
    return dateStr;
  }
  if (!dateStr || dateStr === '') {
    return null;
  }
  const i = dateStr.indexOf(_datereg);
  if (i >= 0) {
    const m = _re.exec(dateStr);
    const d = parseInt(m[0], null);
    return new Date(d);
  } else {
    if (isNaN(dateStr)) {
      return new Date(dateStr);
    } else {
      const d = parseInt(dateStr, null);
      return new Date(d);
    }
  }
}

function createError(path: string, name: string, code: string): ErrorMessage {
  let x = name;
  if (path && path.length > 0) {
    x = path + '.' + name;
  }
  const error = {
    field: x,
    code
  };
  return error;
}

function validateObject(obj: any, meta: Metadata, errors: ErrorMessage[], path: string, max?: number): void {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const attr: Attribute = meta.attributes[key];
    if (!attr) {
      const error = createError(path, key, 'undefined');
      errors.push(error);
    } else {
      const name = attr.name;
      const v = obj[name];
      if (v) {
        switch (attr.type) {
          case DataType.String: {
            if (typeof v !== 'string') {
              const error = createError(path, name, 'string');
              errors.push(error);
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case DataType.Number:
          case DataType.Integer: {
            // If value is not number
            if (typeof v !== 'number') {
              const error = createError(path, name, 'number');
              errors.push(error);
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case DataType.Date: {
            // If value is not date
            const date = toDate(v);
            const error = date.toString();
            if (!(date instanceof Date) || error === 'Invalid Date') {
              const err = createError(path, name, 'date');
              errors.push(err);
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case DataType.Boolean: {
            // If value is not bool
            if ((typeof v === 'boolean') !== true) {
              const err = createError(path, name, 'boolean');
              errors.push(err);
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case DataType.Object: {
            if (typeof v !== 'object') {
              const err = createError(path, name, 'object');
              errors.push(err);
              if (errors.length >= max) {
                return;
              }
            } else {
              if (Array.isArray(v)) {
                const err = createError(path, name, 'object');
                errors.push(err);
                if (errors.length >= max) {
                  return;
                }
              } else {
                const x = (path != null && path.length > 0 ? path + '.' + key : key);
                validateObject(v, attr.typeof, errors, x);
              }
            }
            break;
          }
          case DataType.Array: {
            if (typeof v !== 'object') {
              const err = createError(path, name, 'array');
              errors.push(err);
              if (errors.length >= max) {
                return;
              }
            } else {
              if (!Array.isArray(v)) {
                const err = createError(path, name, 'array');
                errors.push(err);
                if (errors.length >= max) {
                  return;
                }
              } else {
                for (let i = 0; i < v.length; i++) {
                  if (typeof v !== 'object') {
                    const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                    const err = createError('', y, 'object');
                    errors.push(err);
                    if (errors.length >= max) {
                      return;
                    }
                  } else {
                    const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                    validateObject(v[i], attr.typeof, errors, y);
                  }
                }
              }
            }
            break;
          }
          case DataType.Primitives: {
            if (typeof v !== 'object') {
              const err = createError(path, name, 'array');
              errors.push(err);
            } else {
              if (!Array.isArray(v)) {
                const err = createError(path, name, 'array');
                errors.push(err);
                if (errors.length >= max) {
                  return;
                }
              } else {
                if (attr.code) {
                  if (attr.code === 'date') {
                    for (let i = 0; i < v.length; i++) {
                      if (v[i]) {
                        const date = toDate(v);
                        const error = date.toString();
                        if (!(date instanceof Date) || error === 'Invalid Date') {
                          const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                          const err = createError('', y, 'date');
                          errors.push(err);
                          if (errors.length >= max) {
                            return;
                          }
                        }
                      }
                    }
                  } else {
                    for (let i = 0; i < v.length; i++) {
                      if (v[i] && typeof v[i] !== attr.code) {
                        const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                        const err = createError('', y, attr.code);
                        errors.push(err);
                        if (errors.length >= max) {
                          return;
                        }
                      }
                    }
                  }
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
    }
  }
}

export function validateTypes(obj: any, meta: Metadata, max?: number): ErrorMessage[] {
  const errors: ErrorMessage[] = [];
  const path = '';
  validateObject(obj, meta, errors, path, max);
  return errors;
}
