import { Link, useParams } from 'react-router-dom'

const Root = () => {
  const { provider, owner, repo, pullid } = useParams()

  return (
    <>
      <h1>Root</h1>
      <p>{pullid}</p>
      <Link
        to={`/${provider}/${owner}/${repo}/pull/${pullid}/tree/src/ui/Button/Button.js`}
      >
        File link
      </Link>
    </>
  )
}

export default Root
