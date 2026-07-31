export type FieldType = 'text' | 'select' | 'checkbox'

export interface FieldOption {
  label: string
  value: string
}

export interface FieldConfig {
  type: FieldType
  name: string
  label: string
  required?: boolean
  options?: FieldOption[]
}

export type FieldValue = string | boolean

export type FormModel = Record<string, FieldValue>
