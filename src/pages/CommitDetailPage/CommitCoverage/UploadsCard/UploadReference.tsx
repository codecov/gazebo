import A from 'ui/A'

interface UploadReferenceProps {
  buildCode?: string | null
  name?: string | null
  ciUrl?: string | null
}

const UploadReference = ({ ciUrl, name, buildCode }: UploadReferenceProps) => {
  const uploadRef = name || buildCode

  if (ciUrl) {
    return (
      // @ts-expect-error
      <A href={ciUrl} hook="ci job" isExternal={true}>
        {uploadRef}
      </A>
    )
  }
  return <p>{uploadRef}</p>
}

export default UploadReference
