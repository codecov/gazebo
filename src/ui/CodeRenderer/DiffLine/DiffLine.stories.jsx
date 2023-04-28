import DiffLine from './DiffLine'

// This is copypasted, needs some work
const Template = (args) => {
  const line = [
    { types: { types: ['keyword'] }, content: 'function' },
    { types: { types: ['plain'] }, content: ' ' },
    { types: { types: ['function'] }, content: 'add' },
    { types: { types: ['punctuation'] }, content: '(' },
    { types: { types: ['parameter'] }, content: 'a' },
    { types: { types: ['parameter', 'punctuation'] }, content: ',' },
    { types: { types: ['parameter'] }, content: ' b' },
    { types: { types: ['punctuation'] }, content: ')' },
    { types: { types: ['plain'] }, content: ' ' },
    { types: { types: ['punctuation'] }, content: '{' },
    { types: { types: ['plain'] }, content: '' },
  ]

  return (
    <DiffLine
      line={line}
      number={1}
      {...args}
      getLineProps={() => {}}
      getTokenProps={() => {}}
    />
  )
}

export const DefaultDiffLine = {
  render: Template,

  args: {
    coverage: 'H',
  },
}

export const CoveredButNotShownDiffLine = {
  render: Template,

  args: {
    coverage: 'H',
  },
}

export const PartialDiffLine = {
  render: Template,

  args: {
    coverage: 'P',
  },
}

export const UncoveredDiffLine = {
  render: Template,

  args: {
    coverage: 'M',
  },
}

export default {
  title: 'Components/CodeRenderer/DiffLine',
  component: DiffLine,
}
