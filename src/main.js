import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    // Get inputs
    const targetBranch = core.getInput('branch')
    const reviewersInput = core.getInput('reviewers')
    const teamReviewersInput = core.getInput('team-reviewers')
    const token = core.getInput('token')

    // Validate inputs
    if (!targetBranch) {
      throw new Error('Branch input is required')
    }
    if (!reviewersInput && !teamReviewersInput) {
      throw new Error(
        'At least one of reviewers or team-reviewers must be provided'
      )
    }

    // Get the current context
    const context = github.context

    // Check if this is a pull request event
    if (
      context.eventName !== 'pull_request' &&
      context.eventName !== 'pull_request_target'
    ) {
      core.info('This action only runs on pull request events')
      return
    }

    const pullRequest = context.payload.pull_request
    if (!pullRequest) {
      throw new Error('Could not get pull request from context')
    }

    // Check if the target branch matches
    const prTargetBranch = pullRequest.base.ref
    core.info(`Pull request target branch: ${prTargetBranch}`)
    core.info(`Configured target branch: ${targetBranch}`)

    if (prTargetBranch !== targetBranch) {
      core.info(
        `Target branch ${prTargetBranch} does not match configured branch ${targetBranch}. Skipping reviewer assignment.`
      )
      return
    }

    /**
     * Parses a comma-separated string input into an array of trimmed, non-empty strings.
     *
     * @param {string} input
     * @returns {string[]}
     */
    function parseInputList(input) {
      return input
        ? input
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item)
        : []
    }

    // Parse reviewers and team reviewers
    const reviewers = parseInputList(reviewersInput)
    const teamReviewers = parseInputList(teamReviewersInput)

    core.info(`Reviewers to add: ${reviewers.join(', ')}`)
    if (teamReviewers.length > 0) {
      core.info(`Team reviewers to add: ${teamReviewers.join(', ')}`)
    }

    // Create GitHub client
    const octokit = github.getOctokit(token)

    // Request reviewers
    const requestData = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequest.number,
      ...(reviewers.length > 0 && { reviewers }),
      ...(teamReviewers.length > 0 && { team_reviewers: teamReviewers })
    }

    core.debug(`Request reviewers payload: ${JSON.stringify(requestData)}`)

    const response = await octokit.rest.pulls.requestReviewers(requestData)

    // Set outputs
    const addedReviewers =
      response.data.requested_reviewers?.map((r) => r.login) || []
    const addedTeams = response.data.requested_teams?.map((t) => t.slug) || []

    core.setOutput('reviewers-added', addedReviewers.join(','))
    core.setOutput('teams-added', addedTeams.join(','))

    core.info(`Successfully added reviewers: ${addedReviewers.join(', ')}`)
    if (addedTeams.length > 0) {
      core.info(`Successfully added team reviewers: ${addedTeams.join(', ')}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
