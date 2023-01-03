import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

function DirEntry({ branch, name, path, runPrefetch }) {
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
  runPrefetch: PropTypes.func,
}

export default DirEntry
