import { useParams } from 'react-router-dom'

const FileDiff = () => {
  const { path } = useParams()
  return (
    <>
      <h1>Diff comparson</h1>
      <p>{path}</p>
    </>
  )
}

export default FileDiff
