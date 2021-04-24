let baseClasses =
  'rounded-full h-8 w-8 flex items-center justify-center border-ds-grey-secondary border-2'

// TODO -- what improvements are needed over existing avatar

function Avatar({ avatarUrl, alt, userName }) {
  return (
    <>
      {avatarUrl && <img src={avatarUrl} alt={alt} className={baseClasses} />}
      {!avatarUrl && (
        <svg
          data-testid="bb-avatar"
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
            {userName[0]}
          </text>
        </svg>
      )}
    </>
  )
}

Avatar.propTypes = {
  avatarUrl: String,
  alt: String,
  userName: String,
}

export default Avatar
