import uniqueId from 'lodash/uniqueId'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

interface ToggleProps {
  value?: boolean
  label: string
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  dataMarketing: string
}

function Toggle({
  label,
  value = false,
  onClick,
  disabled = false,
  isLoading = false,
  dataMarketing,
}: ToggleProps) {
  const ID = uniqueId('toggle')

  return (
    <div
      data-marketing={`${ID}-${dataMarketing}`}
      onClick={() => {
        if (!disabled && !isLoading) {
          onClick()
        }
      }}
      className="flex items-center gap-1.5"
    >
      {label && (
        <label htmlFor={ID} className="cursor-pointer xl:whitespace-nowrap ">
          {label}
        </label>
      )}
      <button
        id={ID}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-50 focus:ring-offset-2',
          {
            'bg-toggle-active': value,
            'bg-toggle-inactive': !value && !disabled,
            'bg-toggle-disabled': disabled,
            'cursor-not-allowed': disabled || isLoading,
          }
        )}
        aria-pressed="false"
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
      >
        <span
          data-testid="switch"
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-ds-container shadow ring-0 transition duration-200 ease-in-out dark:bg-white',
            {
              'translate-x-5': value,
              'translate-x-0': !value,
            }
          )}
        >
          <div
            className={cn('flex size-5 items-center justify-center', {
              'text-toggle-active': value,
              'text-toggle-inactive': !value && !disabled,
              'text-toggle-disabled': disabled,
            })}
          >
            {isLoading ? (
              <div
                data-testid="toggle-loading-spinner"
                className={cn(
                  'size-4 animate-spin rounded-full border-4 border-white',
                  {
                    'border-t-toggle-active': value,
                    'border-t-toggle-inactive': !value && !disabled,
                  }
                )}
              />
            ) : (
              <Icon
                name={value ? 'check' : 'x'}
                label={value ? 'check' : 'x'}
                variant="solid"
                size="flex"
              />
            )}
          </div>
        </span>
      </button>
    </div>
  )
}

export default Toggle
