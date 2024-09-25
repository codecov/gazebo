import Icon from 'ui/Icon'

interface CIStatusLabelProps {
  ciPassed?: boolean | null
}

export default function CIStatusLabel({ ciPassed }: CIStatusLabelProps) {
  if (typeof ciPassed !== 'boolean') {
    return (
      <span className="flex flex-none items-center gap-1 text-xs">
        <span className="text-ds-gray-senary">
          <Icon size="sm" name="ban" />
        </span>
        No Status
      </span>
    )
  }

  const iconName = ciPassed ? 'check' : 'x'

  return (
    <span className="flex flex-none items-center gap-1 text-xs">
      <span
        className={ciPassed ? 'text-ds-primary-green' : 'text-ds-primary-red'}
      >
        <Icon size="sm" name={iconName} label={iconName} />
      </span>
      CI {ciPassed ? 'Passed' : 'Failed'}
    </span>
  )
}
