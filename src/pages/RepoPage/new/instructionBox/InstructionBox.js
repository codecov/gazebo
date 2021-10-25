import { useState } from 'react'
import CopyClipboard from 'ui/CopyClipboard/CopyClipboard'

function InstructionBox() {
  const [system, setSystem] = useState('linux')
  const [windows, setWindows] = useState(false)
  const active = 'bg-gray-100'
  const [activeStyles, setActiveStyles] = useState([active, '', '', ''])

  const passStyle = (name) => {
    const initialStyles = ['', '', '', '']
    if (name === 'linux') {
      initialStyles[0] = active
    } else if (name === 'alpine') {
      initialStyles[1] = active
    } else if (name === 'macos') {
      initialStyles[2] = active
    } else {
      initialStyles[3] = active
    }
    setActiveStyles(initialStyles)
  }

  const handleInstructionClick = (e) => {
    e.preventDefault()
    const { name } = e.target
    setSystem(name)
    setWindows(name === 'windows')
    passStyle(name)
  }

  return (
    <div className="h-40 w-5/5 bg-ds-gray-primary my-4 rounded w-auto">
      <div className="flex flex-row bg-ds-gray-secondary h-8">
        <button
          className={`w-14 self-center h-8 outline-none hover:bg-gray-300 ${activeStyles[0]}`}
          autoFocus
          onClick={handleInstructionClick}
          name="linux"
        >
          Linux
        </button>
        <button
          className={`w-28 self-center h-8 outline-none hover:bg-gray-300 ${activeStyles[1]}`}
          onClick={handleInstructionClick}
          name="alpine"
        >
          Alpine Linux
        </button>
        <button
          className={`w-20 self-center h-8 outline-none hover:bg-gray-300 ${activeStyles[2]}`}
          onClick={handleInstructionClick}
          name="macos"
        >
          macOS
        </button>
        <button
          className={`w-24 self-center h-8 outline-none hover:bg-gray-300 ${activeStyles[3]}`}
          onClick={handleInstructionClick}
          name="windows"
        >
          Windows
        </button>
      </div>
      <div className="p-4 flex flex-row overflow-scroll">
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
        <span className="md:ml-auto">
          <CopyClipboard
            string={
              windows
                ? "$ProgressPreference = 'SilentlyContinue' Invoke-WebRequest -Uri https://uploader.codecov.io/latest/windows/codecov.exe -Outfile codecov.exe .\\codecov.exe "
                : 'curl -Os https://uploader.codecov.io/latest/macos/codecov chmod +x codecov ./codecov'
            }
          />
        </span>
      </div>
    </div>
  )
}

export default InstructionBox
