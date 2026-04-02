import useVuelidate from '@vuelidate/core'
import { get } from '@vueuse/core'
import { computed, inject, provide } from 'vue'
import { getProp } from './object.js'

const symbol = Symbol('validator')

export function useValidator(validationsArgs, state, globalConfig) {
  if (validationsArgs && state) {
    const validator = useVuelidate(validationsArgs, state, globalConfig)

    provide(symbol, validator)

    return validator
  }

  return inject(symbol, { value: {} })
}

export function useFieldValidation(path) {
  const validator = useValidator()

  return computed(() => {
    const pathStr = get(path)
    if (!pathStr) {
      return null
    }

    return getProp(validator.value, pathStr)
  })
}

export function useValidation(props) {
  const fieldPath = computed(() => props.name)
  const fieldValidation = useFieldValidation(fieldPath)

  const error = computed(() => {
    if (props.error) {
      return true
    }

    return fieldValidation.value?.$error
  })

  const errorMessage = computed(() => {
    if (props.errorMessage) {
      return props.errorMessage
    }

    return fieldValidation.value?.$errors?.[0]?.$message
  })

  return {
    error,
    errorMessage,
  }
}
