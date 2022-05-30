import PropTypes from 'prop-types'

import { CODE_RENDERER_INFO } from 'shared/utils/fileviewer'
import A from 'ui/A'
import Icon from 'ui/Icon'

const message = {
  [CODE_RENDERER_INFO.UNEXPECTED_CHANGES]: (
    <div className="flex gap-1">
      <Icon variant="outline" name="information-circle" size="sm" />
      <span>
        indirect coverage change{' '}
        <A to={{ pageName: 'unexpectedChanges' }}>learn more</A>
      </span>
    </div>
  ),
  [CODE_RENDERER_INFO.EMPTY]: CODE_RENDERER_INFO.EMPTY,
}

function CodeRendererInfoRow({ type, patch }) {
  /**
   * Row to display information related to the code rendered
   * @param {String} type type of information to be shown
   */

  return (
    <div className="flex gap-2 bg-ds-gray-primary border-t px-4 py-1 border-r border-l border-solid border-ds-gray-tertiary text-xs text-ds-gray-quinary">
      <span data-testid="patch">{patch}</span>
      {message[type]}
    </div>
  )
}

CodeRendererInfoRow.propTypes = {
  type: PropTypes.string,
  patch: PropTypes.string,
}

export default CodeRendererInfoRow
