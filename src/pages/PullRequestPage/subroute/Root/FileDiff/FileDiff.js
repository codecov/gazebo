import PropTypes from 'prop-types'
import { Fragment } from 'react'

import { LINE_TYPE } from 'shared/FileViewer/lineStates'

const FileDiff = ({ headName, segments = [] }) => {
  return (
    <div>
      <p>{headName}</p>
      {segments.map((segment, i) => (
        <Fragment key={`line-${i}`}>
          <p>{segment.header}</p>
          {segment.lines.map((line, i) => (
            <p key={`line-${line.content}-${i}`}>{line.content}</p>
          ))}
        </Fragment>
      ))}
    </div>
  )
}

FileDiff.propTypes = {
  headName: PropTypes.string,
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string,
      lines: PropTypes.shape({
        baseNumber: PropTypes.string,
        headNumber: PropTypes.string,
        baseCoverage: PropTypes.PropTypes.objectOf(
          PropTypes.oneOf([LINE_TYPE.HIT, LINE_TYPE.MISS, LINE_TYPE.PARTIAL])
        ),
        headCoverage: PropTypes.PropTypes.objectOf(
          PropTypes.oneOf([LINE_TYPE.HIT, LINE_TYPE.MISS, LINE_TYPE.PARTIAL])
        ),
        content: PropTypes.string,
      }),
    })
  ),
}

export default FileDiff
