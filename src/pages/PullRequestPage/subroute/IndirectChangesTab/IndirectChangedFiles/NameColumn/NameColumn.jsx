import PropTypes from 'prop-types'

import { usePrefetchSingleFileComp } from 'services/pull'
import Icon from 'ui/Icon'

export default function NameColumn({ row, getValue }) {
  const nameColumn = row.getValue('name')
  const [fileNames] = nameColumn?.props?.children
  const path = fileNames?.props?.children

  const { runPrefetch } = usePrefetchSingleFileComp({
    path,
    filters: { hasUnintendedChanges: true },
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
        className={row.getIsExpanded() ? 'text-ds-blue-darker' : 'text-current'}
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
