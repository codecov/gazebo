import CodeRenderer from './CodeRenderer'
import CodeRendererInfoRow from './CodeRendererInfoRow'
import DiffLine from './DiffLine'
import SingleLine from './SingleLine'

const SingleLineTemplate = (args) => {
  return (
    <>
      <CodeRendererInfoRow>
        <span>
          Header for the code renderer, put whatever the design needs.
        </span>
      </CodeRendererInfoRow>
      <CodeRenderer
        {...args}
        rendererType="SINGLE-LINE"
        LineComponent={({ i, ...props }) => (
          <SingleLine
            key={i + 1}
            number={i + 1}
            coverage={['M', 'P', 'H'][Math.floor(Math.random() * 3)]}
            {...props}
          />
        )}
      />
    </>
  )
}

const DiffTemplate = (args) => {
  return (
    <>
      <CodeRendererInfoRow>
        <span>
          Header for the code renderer, put whatever the design needs.
        </span>
      </CodeRendererInfoRow>
      <CodeRenderer
        {...args}
        rendererType="DIFF"
        LineComponent={({ i, line, ...props }) => {
          console.log(props)
          return (
            <DiffLine
              key={i + 1}
              headNumber={i + 1}
              baseNumber={i}
              lineContent={line}
              headCoverage={['M', 'P', 'H'][Math.floor(Math.random() * 3)]}
              baseCoverage={['M', 'P', 'H'][Math.floor(Math.random() * 3)]}
              edgeOfFile={i <= 2}
              {...props}
            />
          )
        }}
      />
    </>
  )
}

const code = `function add() {
    return 1+3
}
console.log(add())

const test = 1234;
`

export const SingleLineCodeRenderer = SingleLineTemplate.bind({})
SingleLineCodeRenderer.args = {
  code: code,
  fileName: 'myFile.js',
}

export const DiffCodeRenderer = DiffTemplate.bind({})
DiffCodeRenderer.args = {
  code: code,
  fileName: 'myFile.js',
}

export default {
  title: 'Components/CodeRenderer',
  component: CodeRenderer,
}
