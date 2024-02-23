import A from 'ui/A'

const ExampleBlurb = () => {
  return (
    <div data-testid="example-blurb">
      &#128193; See an example{' '}
      <A
        to={{ pageName: 'codecovExampleWorkflow' }}
        isExternal
        hook="codecov-workflow-intro"
      >
        repo here
      </A>{' '}
      and{' '}
      <A
        to={{ pageName: 'codecovActionRepo' }}
        isExternal
        hook="codecov-cli-intro"
      >
        our CLI.
      </A>
      <br />
      <br />
      &#128161; Check out our{' '}
      <A
        to={{ pageName: 'codecovYamlValidator' }}
        isExternal
        hook="codecov-yaml-extension-intro"
      >
        YAML validator
      </A>{' '}
      VSCode extension
    </div>
  )
}

export default ExampleBlurb
