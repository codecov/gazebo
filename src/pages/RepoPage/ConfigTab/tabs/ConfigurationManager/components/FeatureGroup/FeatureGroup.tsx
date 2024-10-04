import A from 'ui/A'
import Button from 'ui/Button'
import { Card } from 'ui/Card'

interface FeatureGroupProps extends React.PropsWithChildren {
  title: string
  getStartedLink?: string // navLink key
  showGetStartedLink?: boolean
}

function FeatureGroup({
  title,
  getStartedLink,
  showGetStartedLink,
  children,
}: FeatureGroupProps) {
  return (
    <Card className="pb-5">
      <Card.Header className="flex">
        <Card.Title size="xl" className="flex-1">
          {title}
        </Card.Title>
        {showGetStartedLink && getStartedLink ? (
          <Button
            to={{ pageName: getStartedLink }}
            disabled={false}
            variant="primary"
            hook="configuration-get-started"
            data-testid="FeatureGroup-get-started"
          >
            Get Started
          </Button>
        ) : null}
      </Card.Header>
      {children}
    </Card>
  )
}

function UniversalItems({ children }: React.PropsWithChildren) {
  return (
    <Card.Content className="mb-0 flex flex-col gap-2">{children}</Card.Content>
  )
}

interface ProItemsProps extends React.PropsWithChildren {
  isTeamPlan?: boolean
}

function ProItems({ isTeamPlan, children }: ProItemsProps) {
  if (isTeamPlan) {
    return (
      <Card.Footer className="mt-5 flex flex-col gap-2 pb-0">
        <p className="flex items-baseline gap-1">
          <span className="font-medium text-ds-gray-quinary">
            Available with Pro Plan
          </span>
          <span className="h-min text-xs">
            <A
              to={{ pageName: 'upgradeOrgPlan' }}
              hook="configuration-upgrade"
              isExternal={false}
              variant="medium"
            >
              upgrade
            </A>
          </span>
        </p>
        {children}
      </Card.Footer>
    )
  }

  return (
    <Card.Content className="mb-0 mt-2 flex flex-col gap-2">
      {children}
    </Card.Content>
  )
}

export default Object.assign(FeatureGroup, {
  UniversalItems,
  ProItems,
})
