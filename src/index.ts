export type Type = 'ObjectId' | 'date' | 'datetime' | 'time'
  | 'boolean' | 'number' | 'integer' | 'string' | 'text'
  | 'object' | 'array' | 'binary'
  | 'primitives' | 'booleans' | 'numbers' | 'integers' | 'strings' | 'dates' | 'datetimes' | 'times';
export type DataType = Type;
export interface ErrorMessage {
  field: string;
  code: string;
}
export interface Attribute {
  name?: string;
  type?: Type;
  code?: string;
  typeof?: Attributes;
}
export interface Attributes {
  [key: string]: Attribute;
}
// tslint:disable-next-line:class-name
export class resources {
  static ignoreDate?: boolean;
}
export function isStrings(s?: string[]): boolean {
  if (!s || s.length === 0) {
    return true;
  }
  for (const x of s) {
    if (typeof x !== 'string') {
      return false;
    }
  }
  return true;
}
export function isDates(s?: Date[]): boolean {
  if (!s || s.length === 0) {
    return true;
  }
  for (const x of s) {
    if (!(x instanceof Date)) {
      return false;
    }
  }
  return true;
}
export function isNumbers(s?: number[]): boolean {
  if (!s || s.length === 0) {
    return true;
  }
  for (const x of s) {
    if (typeof x !== 'number') {
      return false;
    }
  }
  return true;
}
export function isIntegers(s?: number[]): boolean {
  if (!s || s.length === 0) {
    return true;
  }
  for (const x of s) {
    if (Number.isInteger(x)) {
      return false;
    }
  }
  return true;
}
function createError(path: string, name: string, code?: string): ErrorMessage {
  let x = name;
  if (path && path.length > 0) {
    x = path + '.' + name;
  }
  if (!code) {
    code = 'string';
  }
  const error: ErrorMessage = {
    field: x,
    code
  };
  return error;
}

const _datereg = '/Date(';
const _re = /-?\d+/;
function toDate(v: any): Date | null | undefined {
  if (!v) {
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
    if (m !== null) {
      const d = parseInt(m[0], 10);
      return new Date(d);
    } else {
      return null;
    }
  } else {
    if (isNaN(v)) {
      return new Date(v);
    } else {
      const d = parseInt(v, 10);
      return new Date(d);
    }
  }
}
function validateObject(obj: any, attributes: Attributes, errors: ErrorMessage[], path: string, allowUndefined?: boolean, patch?: boolean): void {
  const keys = Object.keys(obj);
  let count = 0;
  for (const key of keys) {
    count = count + 1;
    const attr: Attribute = attributes[key];
    if (!attr) {
      if (!allowUndefined) {
        errors.push(createError(path, key, 'undefined'));
        return;
      }
    } else {
      attr.name = key;
      const na = attr.name;
      const v = obj[na];
      if (v !== null) {
        const t = typeof v;
        const at = attr.type;
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
            } else if (attr.type !== 'number') {
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
                  for (let i = 0; i < v.length; i++) {
                    if (typeof v !== 'object') {
                      const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                      errors.push(createError('', y, 'object'));
                      return;
                    } else if (attr.typeof) {
                      const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
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
                  } else {
                    if (!Array.isArray(v)) {
                      errors.push(createError(path, na, 'array'));
                      return;
                    } else {
                      if (attr.code) {
                        if (attr.code === 'date') {
                          for (let i = 0; i < v.length; i++) {
                            if (v[i]) {
                              const date3 = toDate(v);
                              if (date3) {
                                const error3 = date3.toString();
                                if (!(date3 instanceof Date) || error3 === 'Invalid Date') {
                                  const y = (path != null && path.length > 0 ? path + '.' + key + '[' + i + ']' : key + '[' + i + ']');
                                  const err = createError('', y, 'date');
                                  errors.push(err);
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
            } else {
              switch (attr.type) {
                case 'datetime':
                  const date = toDate(v);
                  if (date) {
                    const error = date.toString();
                    if (!(date instanceof Date) || error === 'Invalid Date') {
                      errors.push(createError(path, na, 'date'));
                      return;
                    } else {
                      if (!(v instanceof Date)) {
                        obj[na] = date;
                      }
                    }
                  }
                  break;
                case 'date': {
                  if (resources.ignoreDate) {
                    const date2 = toDate(v);
                    if (date2) {
                      const error2 = date2.toString();
                      if (!(date2 instanceof Date) || error2 === 'Invalid Date') {
                        errors.push(createError(path, na, 'date'));
                        return;
                      } else {
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
                  } else {
                    if (Array.isArray(v)) {
                      errors.push(createError(path, na, 'object'));
                      return;
                    } else if (attr.typeof) {
                      const x = (path != null && path.length > 0 ? path + '.' + key : key);
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
  const aks = Object.keys(attributes);
  if (!allowUndefined) {
    if (count >= aks.length) {
      return;
    }
  }
}
export function validate(obj: any, attributes: Attributes, allowUndefined?: boolean, patch?: boolean): ErrorMessage[] {
  const errors: ErrorMessage[] = [];
  const path = '';
  validateObject(obj, attributes, errors, path, allowUndefined, patch);
  return errors;
}
export const check = validate;
