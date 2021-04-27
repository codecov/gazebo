import PropTypes from 'prop-types'

function AvatarSVG({ userName }) {
  return (
    <svg
      data-testid="svg-avatar"
      className="h-6 w-6 rounded-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
    >
      <rect width="50px" height="50px" fill="#2684FF" />
      <text
        data-testid="svg-avatar-text"
        x="50%"
        y="50%"
        textAnchor="middle"
        fill="white"
        fontSize="17px"
        dy=".3em"
      >
        {userName[0]}
      </text>
    </svg>
  )
}

AvatarSVG.propTypes = {
  userName: PropTypes.string,
}

export default AvatarSVG
