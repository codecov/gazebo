import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

function DirEntry({ linkRef, name, path, runPrefetch }) {
  return (
    <div className="flex gap-3" onMouseEnter={async () => await runPrefetch()}>
      <A
        to={{
          pageName: 'treeView',
          options: {
            ref: linkRef,
            tree: !!path ? `${path}/${name}` : name,
          },
        }}
      >
        <Icon name="folder" size="md" variant="solid" />
        <span className="whitespace-pre">{name}</span>
      </A>
    </div>
  )
}

DirEntry.propTypes = {
  linkRef: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
  runPrefetch: PropTypes.func,
}

export default DirEntry
