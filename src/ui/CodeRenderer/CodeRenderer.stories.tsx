import { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import CodeRenderer from './CodeRenderer'
import CodeRendererInfoRow from './CodeRendererInfoRow'
import DiffLine from './DiffLine'
import SingleLine from './SingleLine'

const meta: Meta = {
  title: 'Components/CodeRenderer',
  component: CodeRenderer,
}

export default meta

type Story = StoryObj<typeof CodeRenderer>

const code = `function add() {
  return 1+3
}
console.log(add())

const test = 1234;
`

// just some brute force to make TS happy for this story book
const coverage = ['M', 'P', 'H'][Math.floor(Math.random() * 3)] as
  | 'M'
  | 'P'
  | 'H'
  | null

const hitCount = [null, 1, 10, 100, 1000][Math.floor(Math.random() * 5)] as
  | number
  | null

export const SingleLineCodeRenderer: Story = {
  args: {
    code: code,
    fileName: 'myFile.js',
  },
  render: (args) => {
    return (
      <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
        <CodeRendererInfoRow>
          <span>
            Header for the code renderer, put whatever the design needs.
          </span>
        </CodeRendererInfoRow>
        <CodeRenderer
          {...args}
          rendererType="SINGLE_LINE"
          LineComponent={({ i, ...props }) => (
            <SingleLine
              key={i + 1}
              number={i + 1}
              coverage={coverage}
              {...props}
            />
          )}
        />
      </MemoryRouter>
    )
  },
}

export const DiffCodeRenderer: Story = {
  args: {
    code: code,
    fileName: 'myFile.js',
  },
  render: (args) => {
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
                {...props}
                headNumber={`${i + 1}`}
                baseNumber={`${i}`}
                lineContent={line}
                headCoverage={coverage}
                baseCoverage={coverage}
                hitCount={hitCount}
              />
            )
          }}
        />
      </MemoryRouter>
    )
  },
}
