export const HeaderOnPullFragment = `
fragment HeaderOnPullFragment on Pull {
  pullId
  title
  state
  author {
    username
  }
  head {
    ciPassed
    branchName
  }
  updatestamp
}`

export const SummaryOnPullFragment = `
fragment SummaryOnPullFragment on Pull {
  head {
    commitid
    totals {
      percentCovered
    }
    uploads {
      totalCount
    }
  }
  comparedTo {
    commitid
    uploads {
      totalCount
    }
  }
  compareWithBase: compareWithBaseTemp {
    patchTotals {
      percentCovered
    }
    changeWithParent
    hasDifferentNumberOfHeadAndBaseReports
  }
  commits {
    edges {
      node {
        state
        commitid
      }
    }
  }
}`

export const CommitsOnPullFragment = `
fragment CommitsOnPullFragment on Pull {
  commits {
    edges {
      node {
        state
        commitid
        message
        author {
          username
        }
      }
    }
  }
}
`

export const FlagComparisonsOnPull = `
fragment FlagComparisonsOnPull on Pull {
  compareWithBase: compareWithBaseTemp {
    flagComparisons {
      name
      patchTotals {
        percentCovered
      }
      headTotals {
        percentCovered
      }
      baseTotals {
        percentCovered
      }
    }
  }
}
`

export const ImpactedFilesOnPull = `
fragment ImpactedFilesOnPull on Pull {
  head {
    state
  }
  compareWithBase: compareWithBaseTemp {
    patchTotals {
      percentCovered
    }
    baseTotals {
      percentCovered
    }
    headTotals {
      percentCovered
    }
    impactedFiles(filters:$filters) {
      fileName
      headName
      isCriticalFile
      baseCoverage {
        percentCovered
      }
      headCoverage {
        percentCovered
      }
      patchCoverage {
        percentCovered
      }
      changeCoverage
    }
  }
}
`
