/**
 * Gets a function that extracts a value from an option object
 * @param {string | Function} prop - Property name or getter function
 * @param {string} defaultKey - Default property key if prop is not a function
 * @returns {Function} A function that extracts the value from an option
 */
export function getPropValueFn(prop, defaultKey) {
  if (typeof prop === 'function') {
    return prop
  }

  const key = typeof prop === 'string' ? prop : defaultKey

  return (opt) => {
    if (opt == null) return ''
    if (typeof opt === 'object') {
      return opt[key] ?? ''
    }
    return opt
  }
}

/**
 * Gets the value of a prop from an option using the provided prop definition
 * @param {any} opt - The option object to get value from
 * @param {string | Function} prop - Property name or getter function
 * @param {string} defaultKey - Default property key
 * @returns {any} The extracted value
 */
export function getPropValue(opt, prop, defaultKey) {
  return getPropValueFn(prop, defaultKey)(opt)
}
