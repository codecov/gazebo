import { cva, type VariantProps } from 'cva'
import defaultTo from 'lodash/defaultTo'
import uniqueId from 'lodash/uniqueId'
import { forwardRef, HTMLProps, Ref } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'
import { OutlineIconCollection } from 'ui/Icon/Icon'

const textInput = cva(
  'block h-8 w-full border-ds-gray-tertiary bg-ds-container px-3 text-sm disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary disabled:text-ds-gray-quaternary',
  {
    variants: {
      variant: {
        default: 'rounded border',
        topRounded:
          'border-t border-r border-l focus:border rounded-tl rounded-tr',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface TextInputProps
  extends HTMLProps<HTMLInputElement>,
    VariantProps<typeof textInput> {
  label?: string
  icon?: keyof OutlineIconCollection
  placeholder?: string
  dataMarketing?: string
}

const TextInput = forwardRef(
  (
    {
      type = 'text',
      icon,
      label,
      placeholder,
      variant = 'default',
      ...props
    }: TextInputProps,
    ref: Ref<HTMLInputElement>
  ) => {
    const id = uniqueId('text-input')
    const { className, dataMarketing, ...newProps } = props

    // If no label, the placeholder is used as a hidden label for a11y
    const textLabel = defaultTo(label, placeholder)

    return (
      <div className={className}>
        <label
          htmlFor={id}
          className={cn('mb-2 block font-semibold', {
            'sr-only': !label,
          })}
        >
          {textLabel}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-2 flex h-full items-center text-ds-gray-quaternary">
              <Icon size="sm" variant="outline" name={icon} label={icon} />
            </div>
          )}
          <input
            data-marketing={dataMarketing}
            ref={ref}
            id={id}
            type={type}
            className={cn(textInput({ variant }), {
              'pl-7': Boolean(icon),
            })}
            placeholder={placeholder}
            {...newProps}
          />
        </div>
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput
