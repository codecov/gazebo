import PropTypes from 'prop-types'
import { Fragment } from 'react'

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
  segments: PropTypes.arrayOf(PropTypes.object), // Todo define the shape when we have the final data/components
}

export default FileDiff
