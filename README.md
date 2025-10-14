# Custom Reviewers Branch Action

[![GitHub Super-Linter](https://github.com/firrasaltaher/gh-custom-reviewers-branch-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/firrasaltaher/gh-custom-reviewers-branch-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/firrasaltaher/gh-custom-reviewers-branch-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/firrasaltaher/gh-custom-reviewers-branch-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/firrasaltaher/gh-custom-reviewers-branch-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/firrasaltaher/gh-custom-reviewers-branch-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action that allows you to assign custom reviewers to pull requests
based on the target branch. This action enables you to configure different
reviewers for different branches, making it perfect for organizations with
branch-specific review requirements.

## Features

- ✅ **Branch-specific reviewer assignment**: Configure different reviewers for
  different branches
- ✅ **Individual and team reviewers**: Support for both individual GitHub users
  and team reviewers
- ✅ **Flexible configuration**: Easy to set up with simple inputs
- ✅ **Automatic detection**: Only runs on pull request events
- ✅ **Safe operation**: Validates inputs and handles errors gracefully

## Usage

### Basic Example

```yaml
name: Assign Custom Reviewers

on:
  pull_request:
    types: [opened, reopened, ready_for_review]

jobs:
  assign-reviewers:
    runs-on: ubuntu-latest
    steps:
      - name: Assign reviewers for main branch
        if: github.event.pull_request.base.ref == 'main'
        uses: firrasaltaher/gh-custom-reviewers-branch-action@v1
        with:
          branch: 'main'
          reviewers: 'senior-dev1,senior-dev2,architect'
          team-reviewers: 'core-team,security-team'
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Multiple Branch Configuration

```yaml
name: Branch-specific Reviewers

on:
  pull_request:
    types: [opened, reopened, ready_for_review]

jobs:
  assign-reviewers:
    runs-on: ubuntu-latest
    steps:
      - name: Assign reviewers for main branch
        if: github.event.pull_request.base.ref == 'main'
        uses: firrasaltaher/gh-custom-reviewers-branch-action@v1
        with:
          branch: 'main'
          reviewers: 'senior-dev1,senior-dev2'
          team-reviewers: 'core-team'

      - name: Assign reviewers for develop branch
        if: github.event.pull_request.base.ref == 'develop'
        uses: firrasaltaher/gh-custom-reviewers-branch-action@v1
        with:
          branch: 'develop'
          reviewers: 'dev1,dev2'
          team-reviewers: 'dev-team'

      - name: Assign reviewers for release branches
        if: startsWith(github.event.pull_request.base.ref, 'release/')
        uses: firrasaltaher/gh-custom-reviewers-branch-action@v1
        with:
          branch: ${{ github.event.pull_request.base.ref }}
          reviewers: 'release-manager,qa-lead'
          team-reviewers: 'release-team'
```

## Inputs

| Input            | Description                                                   | Required | Default               |
| ---------------- | ------------------------------------------------------------- | -------- | --------------------- |
| `branch`         | The target branch to match for adding reviewers               | ✅ Yes   |                       |
| `reviewers`      | Comma-separated list of GitHub usernames to add as reviewers  | No\*     |                       |
| `team-reviewers` | Comma-separated list of GitHub team slugs to add as reviewers | No\*     |                       |
| `token`          | GitHub token with appropriate permissions to request reviews  | No       | `${{ github.token }}` |

\*At least one of `reviewers` or `team-reviewers` must be provided.

## Outputs

| Output            | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `reviewers-added` | Comma-separated list of reviewers that were successfully added |
| `teams-added`     | Comma-separated list of teams that were successfully added     |

## Requirements

### Permissions

The action requires the following permissions:

```yaml
permissions:
  pull-requests: write # Required to add reviewers to pull requests
```

### Token Permissions

When using a custom token (instead of the default `GITHUB_TOKEN`), ensure it has
the following scopes:

- `repo` (for private repositories)
- `public_repo` (for public repositories)

## How It Works

1. **Event Detection**: The action only runs on `pull_request` and
   `pull_request_target` events
1. **Branch Matching**: Compares the pull request's target branch with the
   configured `branch` input
1. **Reviewer Assignment**: If branches match, adds the specified reviewers
   and/or team reviewers
1. **Output Generation**: Provides lists of successfully added reviewers and
   teams

## Example Scenarios

### Scenario 1: Different Review Requirements by Branch

```yaml
# main branch: Requires senior developers and security team
- uses: firrasaltaher/gh-custom-reviewers-branch-action@v1
  with:
    branch: 'main'
    reviewers: 'senior-dev1,senior-dev2'
    team-reviewers: 'security-team'

# develop branch: Requires any team member
- uses: firrasaltaher/gh-custom-reviewers-branch-action@v1
  with:
    branch: 'develop'
    reviewers: 'dev1,dev2,dev3'
```

### Scenario 2: Feature Branch Specific Reviews

```yaml
# feature branches: Requires feature team review
- uses: firrasaltaher/gh-custom-reviewers-branch-action@v1
  if: startsWith(github.event.pull_request.base.ref, 'feature/')
  with:
    branch: ${{ github.event.pull_request.base.ref }}
    team-reviewers: 'feature-team'
```

## Error Handling

The action handles various error conditions gracefully:

- **Missing inputs**: Fails with clear error message if required inputs are
  missing
- **API errors**: Catches and reports GitHub API errors
- **Non-PR events**: Silently skips execution on non-pull request events
- **Branch mismatch**: Logs information and skips reviewer assignment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
