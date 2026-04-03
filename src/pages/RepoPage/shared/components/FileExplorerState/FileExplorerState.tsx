import { useEffect, useState } from 'react'

interface FileItem {
  name: string
  type: 'file' | 'dir'
  path: string
}

interface FileExplorerStateProps {
  initialPath?: string
  files: FileItem[]
  onPathChange?: (path: string) => void
}

export function FileExplorerState({
  initialPath = '',
  files,
  onPathChange,
}: FileExplorerStateProps) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [pathMetadata, setPathMetadata] = useState({
    path: initialPath,
    visited: false,
  })

  useEffect(() => {
    if (initialPath) {
      setPathMetadata({ path: initialPath, visited: false })
    }
  }, [initialPath, pathMetadata])

  useEffect(() => {
    if (onPathChange) {
      onPathChange(currentPath)
    }
  }, [onPathChange, currentPath])

  const handleDirectoryClick = (dirPath: string) => {
    setCurrentPath(dirPath)
  }

  const handleBackClick = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/')
    setCurrentPath(parentPath)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {currentPath && (
          <button
            onClick={handleBackClick}
            className="rounded border border-ds-gray-tertiary px-3 py-1 text-sm hover:bg-ds-gray-primary"
          >
            ← Back
          </button>
        )}
        <span className="font-mono text-sm text-ds-gray-senary">
          {currentPath || '/'}
        </span>
      </div>

      <div className="space-y-2">
        {files
          .filter((item) => item.path.startsWith(currentPath))
          .map((item) => (
            <div
              key={item.path}
              className="flex items-center gap-2 rounded border border-ds-gray-tertiary p-2"
            >
              <span className="text-sm">
                {item.type === 'dir' ? '📁' : '📄'}
              </span>
              {item.type === 'dir' ? (
                <button
                  onClick={() => handleDirectoryClick(item.path)}
                  className="text-sm text-ds-blue-default hover:underline"
                >
                  {item.name}
                </button>
              ) : (
                <span className="text-sm">{item.name}</span>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default FileExplorerState
