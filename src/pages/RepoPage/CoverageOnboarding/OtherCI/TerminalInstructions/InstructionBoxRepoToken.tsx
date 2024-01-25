import cs from 'classnames'
import { MouseEvent, useState } from 'react'

import config from 'config'

import CopyClipboard from 'ui/CopyClipboard'

const systemsEnum = Object.freeze({
  LINUX: 'Linux',
  ALPINE: 'Alpine Linux',
  MACOS: 'macOS',
  WINDOWS: 'Windows',
})

const systemsMapper = Object.freeze({
  Linux: 'linux',
  'Alpine Linux': 'alpine',
  macOS: 'macos',
  Windows: 'Windows',
})

const systems = [
  systemsEnum.LINUX,
  systemsEnum.ALPINE,
  systemsEnum.MACOS,
  systemsEnum.WINDOWS,
]

const defaultBaseUrl = 'https://uploader.codecov.io/latest/'

const WindowsSystemInstructions = () => {
  const baseUploaderUrl = config.IS_SELF_HOSTED
    ? `${config.BASE_URL}/uploader/`
    : defaultBaseUrl

  if (config.IS_SELF_HOSTED) {
    return (
      <span>
        curl -Os {baseUploaderUrl}
        windows/codecov
        <br />
        <br />
        chmod +x codecov
        <br />
        ./codecov {config.IS_SELF_HOSTED && <>-u {config.BASE_URL}</>}
      </span>
    )
  }
  return (
    <span>
      $ProgressPreference = &apos;SilentlyContinue&apos;
      <br />
      Invoke-WebRequest -Uri
      https://uploader.codecov.io/latest/windows/codecov.exe -Outfile
      codecov.exe
      <br />
      .\codecov.exe
    </span>
  )
}

export function InstructionBoxRepoToken() {
  const [curSystem, setCurSystem] = useState<string>(systemsEnum.LINUX)

  const handleInstructionClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const name = e.currentTarget.name
    setCurSystem(name)
  }

  const baseUploaderUrl = config.IS_SELF_HOSTED
    ? `${config.BASE_URL}/uploader/`
    : defaultBaseUrl

  return (
    <div
      className="w-auto rounded bg-ds-gray-primary"
      data-testid="instruction-box"
    >
      <div className="flex h-auto flex-row overflow-auto bg-ds-gray-secondary">
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
      <div className="flex flex-row overflow-auto p-4">
        {curSystem === 'Windows' ? (
          <WindowsSystemInstructions />
        ) : (
          <span>
            curl -Os {baseUploaderUrl}
            {systemsMapper[curSystem as keyof typeof systemsMapper]}
            /codecov
            <br />
            <br />
            chmod +x codecov
            <br />
            ./codecov {config.IS_SELF_HOSTED && <>-u {config.BASE_URL}</>}
          </span>
        )}
        <span className="md:ml-auto">
          <CopyClipboard
            string={
              curSystem === 'Windows'
                ? "$ProgressPreference = 'SilentlyContinue' Invoke-WebRequest -Uri https://uploader.codecov.io/latest/windows/codecov.exe -Outfile codecov.exe .\\codecov.exe"
                : `curl -Os https://uploader.codecov.io/latest/${
                    systemsMapper[curSystem as keyof typeof systemsMapper]
                  }/codecov chmod +x codecov ./codecov`
            }
          />
        </span>
      </div>
    </div>
  )
}
