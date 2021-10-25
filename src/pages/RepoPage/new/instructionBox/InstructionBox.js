import { useState } from 'react'
import CopyClipboard from 'ui/CopyClipboard/CopyClipboard'
import cs from 'classnames'

function InstructionBox() {
  const systems = ['Linux', 'Alpine Linux', 'macOS', 'Windows']
  const [curSystem, setCurSystem] = useState('Linux')
  const [systemInstruction, setSystemInstruction] = useState('linux')
  const [isWindows, setIsWindows] = useState(false)

  const handleInstructionClick = (e) => {
    e.preventDefault()
    const { name } = e.target
    setCurSystem(name)
    setSystemInstruction(
      name === 'Alpine Linux' ? 'alpine' : name.toLowerCase()
    )
    setIsWindows(name === 'Windows')
  }

  return (
    <div className="w-5/5 bg-ds-gray-primary my-4 rounded w-auto">
      <div className="flex flex-row bg-ds-gray-secondary h-auto overflow-scroll">
        {systems.map((system, idx) => (
          <button
            className={cs('self-center py-2 px-4 outline-none', {
              'bg-gray-100': system === curSystem,
              'bg-gray-200 hover:bg-gray-300': system !== curSystem,
            })}
            onClick={handleInstructionClick}
            name={system}
            key={idx}
          >
            {system}
          </button>
        ))}
      </div>
      <div className="p-4 flex flex-row overflow-scroll">
        {isWindows ? (
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
            curl -Os https://uploader.codecov.io/latest/{systemInstruction}
            /codecov
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
              isWindows
                ? "$ProgressPreference = 'SilentlyContinue' Invoke-WebRequest -Uri https://uploader.codecov.io/latest/windows/codecov.exe -Outfile codecov.exe .\\codecov.exe "
                : `curl -Os https://uploader.codecov.io/latest/${systemInstruction}/codecov chmod +x codecov ./codecov`
            }
          />
        </span>
      </div>
    </div>
  )
}

export default InstructionBox
