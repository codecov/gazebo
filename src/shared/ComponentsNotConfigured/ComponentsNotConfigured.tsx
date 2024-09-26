import Button from 'ui/Button'
import Icon from 'ui/Icon'

function ComponentsNotConfigured() {
  return (
    <div className="grid gap-4 pt-4">
      <div className="flex flex-col items-center gap-1">
        <p>No data to display</p>
        <p>
          You will need to configure components in your yaml file to view the
          list of your components here.
        </p>
      </div>
      <div className="flex flex-col items-center">
        <Button
          hook="configure-components"
          variant="primary"
          disabled={false}
          to={{ pageName: 'components' }}
          showExternalIcon={false}
        >
          Get started with components
          <Icon
            name="externalLink"
            label="externalLink"
            variant="solid"
            size="sm"
          />
        </Button>
      </div>
    </div>
  )
}

export default ComponentsNotConfigured
