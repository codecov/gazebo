import SingleLine from './SingleLine'

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
    <SingleLine
      line={line}
      number={1}
      {...args}
      getLineProps={() => {}}
      getTokenProps={() => {}}
    />
  )
}

export const DefaultSingleLine = Template.bind({})
DefaultSingleLine.args = {
  coverage: 'H',
}

export const CoveredButNotShownSingleLine = Template.bind({})
CoveredButNotShownSingleLine.args = {
  coverage: 'H',
}

export const PartialSingleLine = Template.bind({})
PartialSingleLine.args = {
  coverage: 'P',
}

export const UncoveredSingleLine = Template.bind({})
UncoveredSingleLine.args = {
  coverage: 'M',
}

export default {
  title: 'Components/SingleLine',
  component: SingleLine,
}
