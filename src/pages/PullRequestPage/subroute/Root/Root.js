import { Link, useParams } from 'react-router-dom'

const Root = () => {
  const { provider, owner, repo, pullId } = useParams()

  return (
    <>
      <h1>Root</h1>
      <p>{pullId}</p>
      <Link
        to={`/${provider}/${owner}/${repo}/pull/${pullId}/tree/src/ui/Button/Button.js`}
      >
        File link
      </Link>
    </>
  )
}

export default Root
