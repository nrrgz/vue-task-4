import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface FormContext {
  errors: Ref<Record<string, string>>
  disabled: Ref<boolean>
}

export const FORM_CONTEXT: InjectionKey<FormContext> = Symbol('dynamic-form')

export function useFormContext(): FormContext {
  const context = inject(FORM_CONTEXT)

  if (context === undefined) {
    throw new Error('Form fields must be rendered inside a DynamicForm')
  }

  return context
}
