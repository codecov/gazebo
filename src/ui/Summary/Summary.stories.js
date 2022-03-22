import Summary from './Summary'

import TotalsNumber from '../TotalsNumber'

const Template = (args) => <Summary {...args} />

export const DefaultSummary = Template.bind({})
DefaultSummary.args = {
  cards: [
    {
      name: 'sample title',
      title: 'Sample title',
      value: <span>Fancy markup</span>,
    },
  ],
}

export const SummaryManyCards = Template.bind({})
SummaryManyCards.args = {
  cards: [
    {
      name: 'Head',
      title: (
        <>
          <span>HEAD</span>
          <span className="text-ds-gray-octonary">fc43199</span>
        </>
      ),
      value: `39.67%`,
    },
    {
      name: 'patch',
      title: 'Patch',
      value: `83.43%`,
    },
    {
      name: 'change',
      title: 'Change',
      value: <TotalsNumber value={27.36} showChange />,
    },
  ],
}

export default {
  title: 'Components/Summary',
  component: Summary,
}
