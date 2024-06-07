import React, { ReactNode } from 'react'

interface FormLabelProps {
  label: string
  icon?: ReactNode
}

const FormLabel: React.FC<FormLabelProps> = ({ label, icon }) => {
  return (
    <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
      {icon && (
        <span data-testid="form-label-icon" className="text-ds-gray-quinary">
          {icon}
        </span>
      )}
      {label}
    </h3>
  )
}

export default FormLabel
