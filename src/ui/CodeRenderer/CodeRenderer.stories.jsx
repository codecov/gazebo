import { MemoryRouter } from 'react-router-dom'

import CodeRenderer from './CodeRenderer'
import CodeRendererInfoRow from './CodeRendererInfoRow'
import DiffLine from './DiffLine'
import SingleLine from './SingleLine'

const SingleLineTemplate = (args) => {
  return (
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
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
    </MemoryRouter>
  )
}

const DiffTemplate = (args) => {
  return (
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
      <CodeRendererInfoRow>
        <span>
          Header for the code renderer, put whatever the design needs.
        </span>
      </CodeRendererInfoRow>
      <CodeRenderer
        {...args}
        rendererType="DIFF"
        LineComponent={({ i, line, ...props }) => {
          return (
            <DiffLine
              key={i + 1}
              headNumber={i + 1}
              baseNumber={i}
              lineContent={line}
              headCoverage={['M', 'P', 'H'][Math.floor(Math.random() * 3)]}
              baseCoverage={['M', 'P', 'H'][Math.floor(Math.random() * 3)]}
              hitCount={[null, 1, 10, 100, 1000][Math.floor(Math.random() * 5)]}
              edgeOfFile={i <= 2}
              {...props}
            />
          )
        }}
      />
    </MemoryRouter>
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
