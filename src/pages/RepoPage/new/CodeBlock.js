import { useState } from 'react'
// import CopyClipboard from 'ui/CopyClipboard/CopyClipboard'

function CodeBlock() {
  const [system, setSystemt] = useState('linux')
  const [windows, setWindows] = useState(false)

  const handleInstructionClick = (e) => {
    e.preventDefault()
    const { name } = e.target
    setWindows(false)
    name === 'linux' && setSystemt('linux')
    name === 'alpine' && setSystemt('alpine')
    name === 'macos' && setSystemt('macos')
    name === 'windows' && setWindows(true)
  }

  return (
    <div className="h-40 w-5/5 bg-ds-gray-primary my-4 overflow-scroll rounded w-auto">
      <div className="flex flex-row bg-ds-gray-secondary h-8">
        <button
          className="w-14 self-center h-8 outline-none hover:bg-gray-300 focus:bg-gray-100"
          autoFocus
          onClick={handleInstructionClick}
          name="linux"
        >
          Linux
        </button>
        <button
          className="w-28 self-center h-8 outline-none hover:bg-gray-300 focus:bg-gray-100"
          onClick={handleInstructionClick}
          name="alpine"
        >
          Alpine Linux
        </button>
        <button
          className="w-20 self-center h-8 outline-none hover:bg-gray-300 focus:bg-gray-100"
          onClick={handleInstructionClick}
          name="macos"
        >
          macOS
        </button>
        <button
          className="w-24 self-center h-8 outline-none hover:bg-gray-300 focus:bg-gray-100"
          onClick={handleInstructionClick}
          name="windows"
        >
          Windows
        </button>
      </div>
      <div className="p-4 flex flex-row">
        {windows ? (
          <span>
            $ProgressPreference = &apos;SilentlyContinue&apos;
            <br />
            Invoke-WebRequest -Uri
            https://uploader.codecov.io/latest/windows/codecov.exe -Outfile
            codecov.exe
            <br />
            .\codecov.exe
          </span>
        ) : (
          <span>
            curl -Os https://uploader.codecov.io/latest/{system}/codecov
            <br />
            <br />
            chmod +x codecov
            <br />
            ./codecov
          </span>
        )}
        {/* <span className='md:ml-auto'>
                    <CopyClipboard string={windows ?
                        "$ProgressPreference = 'SilentlyContinue' Invoke-WebRequest -Uri https://uploader.codecov.io/latest/windows/codecov.exe -Outfile codecov.exe .\codecov.exe -t ${CODECOV_TOKEN}"
                        : 'curl -Os https://uploader.codecov.io/latest/macos/codecov chmod +x codecov ./codecov -t ${CODECOV_TOKEN}'} />
                </span> */}
      </div>
    </div>
  )
}

export default CodeBlock
