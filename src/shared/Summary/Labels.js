import Change from 'ui/Change'
import isNumber from 'lodash/isNumber'
import SummaryCard from 'shared/Summary/SummaryCard'
import A from 'ui/A'

export function totalsLabels({ head, patch, change }) {
  return [
    // TODO: change the "value" for Head and Patch to the component
    {
      name: 'head',
      title: (
        <>
          <span>HEAD</span>
          <span className="text-ds-gray-octonary">
            {head.commitid.substr(0, 7)}
          </span>
        </>
      ),
      value: head.totals.coverage ? `${head?.totals.coverage} %` : '-',
    },
    {
      name: 'patch',
      title: 'Patch',
      value: (
        <span className="text-sm text-right w-full text-ds-gray-octonary">
          {isNumber(patch) ? `${patch?.toFixed(2)}%` : '-'}
        </span>
      ),
    },
    {
      name: 'change',
      title: 'Change',
      value: <Change value={change} variant="coverageCard" />,
    },
  ]
}

export function compareLabels({ headCommit, baseCommit }) {
  return [
    {
      name: 'source',
      title: 'Source',
      value: headCommit && baseCommit && (
        <p className="text-ds-gray-octonary text-sm">
          Coverage data based on{' '}
          <span className="uppercase font-medium">head</span>{' '}
          <A to={{ pageName: 'commit', options: { commit: headCommit } }}>
            {headCommit?.substr(0, 7)}
          </A>{' '}
          compared to <span className="uppercase font-medium">base</span>{' '}
          <A to={{ pageName: 'commit', options: { commit: baseCommit } }}>
            {baseCommit?.substr(0, 7)}
          </A>{' '}
        </p>
      ),
    },
  ]
}

export function mapLabels(labels) {
  return labels.map((element) => {
    const { name, title, value } = element
    return (
      <SummaryCard key={name} title={title}>
        {value}
      </SummaryCard>
    )
  })
}
