import {
  coverageChampionBronze,
  coverageChampionGold,
  coverageChampionSilver,
  patchPerfectionistBronze,
  patchPerfectionistGold,
  patchPerfectionistSilver,
  prsPowerhouseBronze,
  prsPowerhouseGold,
  prsPowerhouseSilver,
} from 'assets/svg/badges'
import { Tooltip } from 'ui/Tooltip'

const BadgesToImages = {
  PATCH_COVERAGE_AVERAGE: {
    BRONZE: {
      src: patchPerfectionistBronze,
      title: 'Patch Perfectionist: Bronze',
      content:
        'For maintaining an average above 80% patch coverage across all PRs in the repo over the last 30 days.',
    },
    SILVER: {
      src: patchPerfectionistSilver,
      title: 'Patch Perfectionist: Silver',
      content:
        'For maintaining an average above 90% patch coverage across all PRs in the repo over the last 30 days.',
    },
    GOLD: {
      src: patchPerfectionistGold,
      title: 'Patch Perfectionist: Gold',
      content:
        'For maintaining an average above 100% patch coverage across all PRs in the repo over the last 30 days.',
    },
  },
  CHANGE_COVERAGE_COUNT: {
    BRONZE: {
      src: coverageChampionBronze,
      title: 'Coverage Champion: Bronze',
      content:
        'For the highest increase of 100 covered lines across all PRs in the repo over the last 30 days.',
    },
    SILVER: {
      src: coverageChampionSilver,
      title: 'Coverage Champion: Silver',
      content:
        'For the highest increase of 150 covered lines across all PRs in the repo over the last 30 days.',
    },
    GOLD: {
      src: coverageChampionGold,
      title: 'Coverage Champion: Gold',
      content:
        'For the highest increase of 200 covered lines across all PRs in the repo over the last 30 days.',
    },
  },
  PR_COUNT: {
    BRONZE: {
      src: prsPowerhouseBronze,
      title: 'PRs Powerhouse: Bronze',
      content:
        'For cracking above 10 PRs across all PRs in the repo over the last 30 days.',
    },
    SILVER: {
      src: prsPowerhouseSilver,
      title: 'PRs Powerhouse: Silver',
      content:
        'For cracking above 15 PRs across all PRs in the repo over the last 30 days.',
    },
    GOLD: {
      src: prsPowerhouseGold,
      title: 'PRs Powerhouse: Gold',
      content:
        'For cracking above 20 PRs across all PRs in the repo over the last 30 days.',
    },
  },
} as const

type Badge = {
  name: keyof typeof BadgesToImages
  tier: keyof (typeof BadgesToImages)[keyof typeof BadgesToImages]
}

function AuthorBadges({ badges }: { badges: Badge[] }) {
  return (
    <Tooltip.Provider delayDuration={0} skipDelayDuration={500}>
      <div className="flex flex-row gap-2">
        {badges.map(({ name, tier }) => (
          <Tooltip key={name}>
            <Tooltip.Trigger>
              <img
                src={BadgesToImages[name][tier].src}
                alt={name}
                className="size-4"
              />
            </Tooltip.Trigger>
            <Tooltip.Content
              side="top"
              className="w-[300px] bg-ds-gray-primary p-4 text-black"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-1 font-semibold">
                  <img
                    src={BadgesToImages[name][tier].src}
                    alt={name}
                    className="size-4"
                  />
                  <span>{BadgesToImages[name][tier].title}</span>
                </div>
                <p className="break-words text-xs">
                  {BadgesToImages[name][tier].content}
                </p>
              </div>
            </Tooltip.Content>
          </Tooltip>
        ))}
      </div>
    </Tooltip.Provider>
  )
}

export default AuthorBadges
