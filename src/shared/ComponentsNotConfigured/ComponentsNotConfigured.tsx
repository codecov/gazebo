import Button from 'ui/Button'

function ComponentsNotConfigured() {
  return (
    <div className="mt-12 grid gap-4">
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
        >
          Get started with components
        </Button>
      </div>
    </div>
  )
}

export default ComponentsNotConfigured
