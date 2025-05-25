import A from 'ui/A'

const ExampleBlurb = () => {
  return (
    <div data-testid="example-blurb">
      &#128193; View a{' '}
      <A
        to={{ pageName: 'codecovExampleJSCircleCIWorkflow' }}
        isExternal
        hook="codecov-workflow-intro"
      >
        JavaScript config.yml example
      </A>{' '}
      and see{' '}
      <A
        to={{ pageName: 'codecovExampleJSCircleCIWorkflowSteps' }}
        isExternal
        hook="codecov-cli-intro"
      >
        the setup on CircleCI
      </A>
      .
    </div>
  )
}

export default ExampleBlurb
