export function injectProp(target, propName, get, set) {
  Object.defineProperty(target, propName, {
    get,
    set,
    enumerable: true,
  })

  return target
}

export function injectMultipleProps(target, props) {
  for (const key in props) {
    if (typeof props[key] === 'function') {
      injectProp(target, key, props[key])
    } else if ('get' in props[key] || 'set' in props[key]) {
      injectProp(target, key, props[key].get, props[key].set)
    } else {
      injectProp(target, key, () => props[key])
    }
  }

  return target
}

export function getProp(opt, path) {
  const pathArr = path.split('.')
  let obj = opt
  for (const key of pathArr) {
    obj = obj?.[key]
    if (obj == null) {
      break
    }
  }

  return obj
}

export function setProp(opt, path, val, overwrite = true) {
  const pathArr = path.split('.')
  let obj = opt
  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i]
    if (obj[key] == null) {
      obj[key] = {}
    }
    obj = obj[key]
  }
  if (overwrite || obj[pathArr[pathArr.length - 1]] == null) {
    obj[pathArr[pathArr.length - 1]] = val
  }
}
