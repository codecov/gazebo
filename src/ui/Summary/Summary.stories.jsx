import Summary from './Summary'

import TotalsNumber from '../TotalsNumber'

export const DefaultSummary = {
  args: {
    fields: [
      {
        name: 'sample title',
        title: 'Sample title',
        value: <span>Fancy markup</span>,
      },
    ],
  },
}

export const SummaryManyFields = {
  args: {
    fields: [
      {
        name: 'Head',
        title: (
          <>
            <span>HEAD</span>
            <span className="text-ds-gray-octonary">fc43199</span>
          </>
        ),
        value: <TotalsNumber value={39.67} plain large />,
      },
      {
        name: 'patch',
        title: 'Patch',
        value: <TotalsNumber value={83.43} plain large />,
      },
      {
        name: 'change',
        title: 'Change',
        value: <TotalsNumber value={27.36} showChange large />,
      },
    ],
  },
}

export default {
  title: 'Components/Summary',
  component: Summary,
}
