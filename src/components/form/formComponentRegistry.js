const registry = new Map()

export function registerFormComponent(type, { component, readonlyComponent }) {
  registry.set(type, { component, readonlyComponent })
}

export function getFormComponent(type) {
  return registry.get(type)
}

export function isRegisteredComponent(type) {
  return registry.has(type)
}
