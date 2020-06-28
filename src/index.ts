export interface Attribute {
  name?: string;
  type: Type;
  code?: string;
  typeof?: Metadata;
}

export enum Type {
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
function toDate(v: any) {
  if (!v || v === '') {
    return null;
  }
  if (v instanceof Date) {
    return v;
  } else if (typeof v === 'number') {
    return new Date(v);
  }
  const i = v.indexOf(_datereg);
  if (i >= 0) {
    const m = _re.exec(v);
    const d = parseInt(m[0], null);
    return new Date(d);
  } else {
    if (isNaN(v)) {
      return new Date(v);
    } else {
      const d = parseInt(v, null);
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

function validateObject(obj: any, meta: Metadata, errors: ErrorMessage[], path: string, max?: number, allowUndefined?: boolean): void {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const attr: Attribute = meta.attributes[key];
    if (!attr) {
      if (!allowUndefined) {
        errors.push(createError(path, key, 'undefined'));
      }
    } else {
      const na = attr.name;
      const v = obj[na];
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
            // If value is not number
            if (typeof v !== 'number') {
              errors.push(createError(path, na, 'number'));
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case Type.Date: {
            // If value is not date
            const date = toDate(v);
            const error = date.toString();
            if (!(date instanceof Date) || error === 'Invalid Date') {
              errors.push(createError(path, na, 'date'));
              if (errors.length >= max) {
                return;
              }
            }
            break;
          }
          case Type.Boolean: {
            // If value is not bool
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
            } else {
              if (Array.isArray(v)) {
                errors.push(createError(path, na, 'object'));
              } else {
                const x = (path != null && path.length > 0 ? path + '.' + key : key);
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
            } else {
              if (!Array.isArray(v)) {
                errors.push(createError(path, na, 'array'));
              } else {
                for (let i = 0; i < v.length; i++) {
                  if (typeof v !== 'object') {
                    const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                    errors.push(createError('', y, 'object'));
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
            if (errors.length >= max) {
              return;
            }
            break;
          }
          case Type.Primitives: {
            if (typeof v !== 'object') {
              errors.push(createError(path, na, 'array'));
            } else {
              if (!Array.isArray(v)) {
                errors.push(createError(path, na, 'array'));
              } else {
                if (attr.code) {
                  if (attr.code === 'date') {
                    for (let i = 0; i < v.length; i++) {
                      if (v[i]) {
                        const date = toDate(v);
                        const error = date.toString();
                        if (!(date instanceof Date) || error === 'Invalid Date') {
                          const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                          errors.push(createError('', y, 'date'));
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

export function validateTypes(obj: any, meta: Metadata, max?: number, allowUndefined?: boolean): ErrorMessage[] {
  const errors: ErrorMessage[] = [];
  const path = '';
  if (max == null) {
    validateObject(obj, meta, errors, path, undefined, allowUndefined);
  } else {
    validateObject(obj, meta, errors, path, max, allowUndefined);
  }
  return errors;
}
