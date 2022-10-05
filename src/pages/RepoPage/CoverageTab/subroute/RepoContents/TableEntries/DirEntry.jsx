import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

import { usePrefetchDirEntry } from './hooks/usePrefetchDirEntry'

function DirEntry({ branch, name, path, filters }) {
  const { runPrefetch } = usePrefetchDirEntry({ branch, path, filters })
  return (
    <div className="flex gap-2" onMouseEnter={async () => await runPrefetch()}>
      <A
        to={{
          pageName: 'treeView',
          options: {
            ref: branch,
            tree: !!path ? `${path}/${name}` : name,
          },
        }}
      >
        <div className="flex gap-2 items-center">
          <Icon name="folder" size="md" variant="solid" />
          {name}
        </div>
      </A>
    </div>
  )
}

DirEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
  filters: PropTypes.shape({
    ordering: PropTypes.shape({
      direction: PropTypes.string,
      parameter: PropTypes.any,
    }),
    searchValue: PropTypes.any,
  }),
}

export default DirEntry
