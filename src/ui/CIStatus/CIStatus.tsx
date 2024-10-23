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
    <Tooltip delayDuration={0} skipDelayDuration={100}>
      <Tooltip.Root>
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
            className="rounded-md bg-ds-gray-primary px-3 py-2 text-xs"
            side="right"
          >
            <p>
              This CI status is based on all of your <br />
              <A
                to={{ pageName: 'requireCIPassDocs' }}
                hook="yml-require-ci-pass-link"
                data-testid="yml-require-ci-pass-link"
                isExternal
              >
                non-Codecov related checks
              </A>
              .
            </p>
            <TooltipArrow className="fill-ds-gray-primary" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip>
  )
}
