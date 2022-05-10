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
  showLines: {
    showCovered: true,
    showUncovered: null,
    showPartial: null,
  },
  coverage: 'H',
}

export const CoveredButNotShownSingleLine = Template.bind({})
CoveredButNotShownSingleLine.args = {
  showLines: {
    showCovered: false,
    showUncovered: null,
    showPartial: null,
  },
  coverage: 'H',
}

export const PartialSingleLine = Template.bind({})
PartialSingleLine.args = {
  showLines: {
    showCovered: null,
    showUncovered: null,
    showPartial: true,
  },
  coverage: 'P',
}

export const UncoveredSingleLine = Template.bind({})
UncoveredSingleLine.args = {
  showLines: {
    showCovered: null,
    showUncovered: true,
    showPartial: null,
  },
  coverage: 'M',
}

export default {
  title: 'Components/SingleLine',
  component: SingleLine,
}
