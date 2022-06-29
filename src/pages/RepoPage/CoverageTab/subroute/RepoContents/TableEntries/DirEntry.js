import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

function DirEntry({ branch, name, path }) {
  return (
    <div className="flex gap-2">
      <Icon name="folder" size="md" />
      <A
        to={{
          pageName: 'treeView',
          options: {
            ref: branch,
            tree: !!path ? `${path}/${name}` : name,
          },
        }}
      >
        {name}
      </A>
    </div>
  )
}

DirEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
}

export default DirEntry
