import cs from 'classnames'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { usePrefetchSingleFileComp } from 'services/pull'
import Icon from 'ui/Icon'

export default function NameColumn({ row, getValue }) {
  const nameColumn = row.getValue('headName')
  const fileNames = nameColumn?.props?.children?.[0]
  const path = fileNames?.props?.children
  const { provider, owner, repo, pullId } = useParams()

  const { runPrefetch } = usePrefetchSingleFileComp({
    provider,
    owner,
    repo,
    pullId,
    path,
    filters: { hasUnintendedChanges: false },
  })

  return (
    <div
      className="flex cursor-pointer items-center gap-2"
      data-testid="name-expand"
      onClick={() => row.toggleExpanded()}
      onMouseEnter={async () => {
        if (!row.getIsExpanded()) {
          await runPrefetch()
        }
      }}
    >
      <span
        className={cs({
          'text-ds-blue-darker': row.getIsExpanded(),
          'text-current': !row.getIsExpanded(),
        })}
      >
        <Icon
          size="md"
          name={row.getIsExpanded() ? 'chevron-down' : 'chevron-right'}
          variant="solid"
        />
      </span>
      {getValue()}
    </div>
  )
}

NameColumn.propTypes = {
  row: PropTypes.object,
  getValue: PropTypes.func,
}
