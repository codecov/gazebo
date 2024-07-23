import A from 'ui/A'
import Button from 'ui/Button'
import { Card } from 'ui/Card'

interface FeatureGroupProps extends React.PropsWithChildren {
  title: string
}

function FeatureGroup({ title, children }: FeatureGroupProps) {
  return (
    <Card className="pb-5">
      <Card.Header className="flex">
        <Card.Title size="xl" className="flex-1">
          {title}
        </Card.Title>
        <Button
          to={undefined}
          disabled={false}
          variant="primary"
          hook="FeatureGroup"
        >
          Get Started
        </Button>
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
  isProPlan?: boolean
}

function ProItems({ isProPlan, children }: ProItemsProps) {
  if (isProPlan) {
    return (
      <Card.Footer className="mt-5 flex flex-col gap-2 pb-0">
        <span className="flex items-baseline gap-1">
          <h4 className="font-medium text-ds-gray-quinary">
            Available with Pro Plan
          </h4>
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
        </span>
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
