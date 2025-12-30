'use client'

import React from 'react'
import { FormField, ProductOptions } from '@/types'

interface DynamicFormFieldProps {
  field: FormField
  value: string | number | boolean | string[]
  onChange: (fieldId: string, value: string | number | boolean | string[]) => void
  error?: string
}

export default function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const baseInputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
    error ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={baseInputClass}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={(value as number) || ''}
            onChange={(e) => onChange(field.id, e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            className={baseInputClass}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="flex flex-wrap gap-3">
            {field.options?.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                  value === option
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="flex flex-wrap gap-3">
            {field.options?.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                  selectedValues.includes(option)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option)
                    onChange(field.id, newValues)
                  }}
                  className="sr-only"
                />
                <span className="font-medium">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface DynamicProductFormProps {
  fields: FormField[]
  values: ProductOptions
  onChange: (fieldId: string, value: string | number | boolean | string[]) => void
  errors: { [key: string]: string }
}

export function DynamicProductForm({ fields, values, onChange, errors }: DynamicProductFormProps) {
  if (!fields || fields.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Product Options</h3>
      {fields.map((field) => (
        <DynamicFormField
          key={field.id}
          field={field}
          value={values[field.id] || ''}
          onChange={onChange}
          error={errors[field.id]}
        />
      ))}
    </div>
  )
}

export function validateProductOptions(
  fields: FormField[],
  values: ProductOptions
): { isValid: boolean; errors: { [key: string]: string } } {
  const errors: { [key: string]: string } = {}

  fields.forEach((field) => {
    const value = values[field.id]

    if (field.required) {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        errors[field.id] = `${field.label} is required`
      }
    }

    if (field.type === 'number' && value !== undefined && value !== '') {
      const numValue = Number(value)
      if (field.min !== undefined && numValue < field.min) {
        errors[field.id] = `${field.label} must be at least ${field.min}`
      }
      if (field.max !== undefined && numValue > field.max) {
        errors[field.id] = `${field.label} must be at most ${field.max}`
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function formatOptionsForDisplay(options: ProductOptions): string[] {
  return Object.entries(options)
    .filter(([_, value]) => value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0))
    .map(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      if (Array.isArray(value)) {
        return `${label}: ${value.join(', ')}`
      }
      return `${label}: ${value}`
    })
}
