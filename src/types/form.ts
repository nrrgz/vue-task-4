export type FieldType = 'text' | 'select' | 'checkbox'

export interface FieldOption {
  label: string
  value: string
}

export type FieldValue = string | boolean

export type TextInputType = 'text' | 'email' | 'password' | 'tel' | 'url'

export type FormModel = Record<string, FieldValue>

export interface FieldConfig<T extends FormModel = FormModel> {
  type: FieldType
  name: Extract<keyof T, string>
  label: string
  required?: boolean
  inputType?: TextInputType
  options?: FieldOption[]
}
