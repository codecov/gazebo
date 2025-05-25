import { cn } from 'shared/utils/cn'

type Option = {
  text: string
}

// All this type stuff is to ensure `active` is some option's text value.
type OptionButtonProps<T extends Option, S extends T['text']> = {
  active: S
  options: readonly T[]
  onChange?: (option: T) => void
  type?: 'button' | 'reset' | 'submit'
  disabled?: boolean
}

export function OptionButton<T extends Option, S extends T['text']>({
  active,
  options,
  onChange = () => {},
  type,
  disabled,
}: OptionButtonProps<T, S>) {
  return (
    <div className="flex flex-wrap divide-x rounded border">
      {options.map((o, index) => {
        return (
          <button
            type={type}
            disabled={disabled}
            className={cn(
              'flex-1 cursor-pointer whitespace-nowrap px-2 py-1 text-sm disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary disabled:text-ds-gray-quaternary',
              {
                'bg-ds-primary-base text-white font-semibold':
                  active === o.text && !disabled,
                'rounded-l': index === 0,
                'rounded-r': index === options.length - 1,
              }
            )}
            onClick={() => {
              onChange(o)
            }}
            key={index}
          >
            {o.text}
          </button>
        )
      })}
    </div>
  )
}
