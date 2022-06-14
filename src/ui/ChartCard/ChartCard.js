import PropTypes from 'prop-types'

import TruncatedMessage from 'pages/CommitPage/Header/TruncatedMessage'
import A from 'ui/A'
import TokenWrapper from 'ui/TokenWrapper'

function ChartCard({ svg, title, content, src }) {
  return (
    <div className="flex flex-col gap-2 border-2 border-ds-gray-primary">
      <div className="flex flex-col flex-1 gap-2 p-4">
        <img src={src} alt="svg chart" className="flex-1" />
        <h2 className="font-semibold">{title}</h2>
        <p className="text-ds-gray-quinary flex-1 text-xs">{content}</p>
      </div>
      <hr />
      <div className="flex flex-col gap-2 p-4">
        <TokenWrapper
          token={
            <TruncatedMessage message={svg} /> //probably change, no need for see more
          }
        />
        <A href={svg} isExternal>
          Open SVG
        </A>
      </div>
    </div>
  )
}

ChartCard.propTypes = {
  src: PropTypes.string,
  svg: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default ChartCard
