import PropTypes from 'prop-types'

function AvatarSVG({ letter, ariaLabel }) {
  return (
    <svg
      data-testid="svg-avatar"
      className="h-6 w-6 rounded-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      aria-label={ariaLabel}
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
        {letter}
      </text>
    </svg>
  )
}

AvatarSVG.propTypes = {
  letter: PropTypes.string,
  ariaLabel: PropTypes.string,
}

export default AvatarSVG
