import cs from 'classnames'
import { useState } from 'react'

import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'
import CopyClipboard from 'ui/CopyClipboard'

export default function InstructionBox() {
  const { data: user } = useUser()

  const systemsEnum = {
    LINUX: 'Linux',
    ALPINE: 'Alpine Linux',
    MACOS: 'macOS',
    WINDOWS: 'Windows',
  }
  const systemsMapper = {
    Linux: 'linux',
    'Alpine Linux': 'alpine',
    macOS: 'macos',
    Windows: 'Windows',
  }
  const systems = [
    systemsEnum.LINUX,
    systemsEnum.ALPINE,
    systemsEnum.MACOS,
    systemsEnum.WINDOWS,
  ]
  const [curSystem, setCurSystem] = useState(systemsEnum.LINUX)

  const handleInstructionClick = (e) => {
    e.preventDefault()
    const { name } = e.target
    setCurSystem(name)
  }

  function handleClipboardClick() {
    trackSegmentEvent({
      event: 'User Onboarding Terminal Uploader Command Clicked',
      data: {
        category: 'Onboarding',
        userId: user?.trackingMetadata?.ownerid,
      },
    })
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
        {curSystem === 'Windows' ? (
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
            curl -Os https://uploader.codecov.io/latest/
            {systemsMapper[curSystem]}
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
              curSystem === 'Windows'
                ? "$ProgressPreference = 'SilentlyContinue' Invoke-WebRequest -Uri https://uploader.codecov.io/latest/windows/codecov.exe -Outfile codecov.exe .\\codecov.exe"
                : `curl -Os https://uploader.codecov.io/latest/${systemsMapper[curSystem]}/codecov chmod +x codecov ./codecov`
            }
            onClick={handleClipboardClick}
          />
        </span>
      </div>
    </div>
  )
}
