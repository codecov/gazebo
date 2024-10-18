import { TooltipArrow } from '@radix-ui/react-tooltip'

import A from 'ui/A'
import Icon from 'ui/Icon'
import { Tooltip } from 'ui/Tooltip'

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
    <Tooltip>
      <Tooltip.Root delayDuration={500}>
        <Tooltip.Trigger>
          <span
            className="flex flex-none items-center gap-1 text-xs"
            data-testid="ci-tooltip-trigger"
          >
            <span
              className={
                ciPassed ? 'text-ds-primary-green' : 'text-ds-primary-red'
              }
            >
              <Icon size="sm" name={iconName} label={iconName} />
            </span>
            CI {ciPassed ? 'Passed' : 'Failed'}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="inline rounded border border-ds-gray-secondary bg-ds-gray-primary px-3 py-2 text-xs"
            side="right"
          >
            <div className="absolute left-[-7px] size-0 border-y-[10px] border-r-[10px] border-y-transparent border-r-ds-gray-secondary" />
            <TooltipArrow className="fill-ds-gray-primary" />
            <span className="text-ds-gray-octonary">
              This CI status is based on all of your{' '}
              <A
                to={{ pageName: 'requireCIPassDocs' }}
                hook="yml-require-ci-pass-link"
                data-testid="docs-link"
                isExternal
              >
                non-Codecov related checks
              </A>
              .
            </span>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip>
  )
}
