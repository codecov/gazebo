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

export const DefaultDiffLine = Template.bind({})
DefaultDiffLine.args = {
  coverage: 'H',
}

export const CoveredButNotShownDiffLine = Template.bind({})
CoveredButNotShownDiffLine.args = {
  coverage: 'H',
}

export const PartialDiffLine = Template.bind({})
PartialDiffLine.args = {
  coverage: 'P',
}

export const UncoveredDiffLine = Template.bind({})
UncoveredDiffLine.args = {
  coverage: 'M',
}

export default {
  title: 'Components/DiffLine',
  component: DiffLine,
}
