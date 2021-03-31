import PropTypes from 'prop-types'

function BBAvatar({ text }) {
  return (
    <svg
      className="h-7 w-7 rounded-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
    >
      <rect width="50px" height="50px" fill="#2684FF" />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fill="white"
        fontSize="17px"
        dy=".3em"
      >
        {text}
      </text>
    </svg>
  )
}

BBAvatar.propTypes = {
  text: PropTypes.string,
}

export default BBAvatar
