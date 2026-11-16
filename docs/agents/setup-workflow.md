# Agent Workflow Setup

This document describes the GitHub Actions workflow for invoking the Copilot agent from issue comments.

## Workflow Overview

**File:** `.github/workflows/agent-invoke.yml`

The workflow responds to commands in GitHub issue comments using the `/oc <command>` syntax.

### Key features:

1. **Trigger:** `issue_comment.created` events only
2. **Access control:** Only issue authors, repo owners, and collaborators with write access can invoke commands
3. **Concurrency:** Previous runs for the same issue are automatically cancelled
4. **Timeouts:**
   - Validation job: 2 minutes
   - Agent execution job: 30 minutes
5. **Permissions:**
   - `contents: read` — read repository code
   - `id-token: write` — generate OIDC tokens for authentication
   - `issues: write` — post comments with results
   - `pull-requests: read` — read PR details

## Setup Instructions

### 1. Install GitHub App (if using OpenCode/MCP)

If using GitHub App for authentication:

1. Go to Settings > Developer settings > GitHub Apps
2. Create a new GitHub App with:
   - Permissions: `contents: read`, `issues: write`, `pull-requests: read`
   - Subscribe to: `issue_comment` events
3. Install the app on the repository
4. Generate a private key and store it securely

Alternatively, the workflow uses the default `github.token` which is available in all workflows.

### 2. Add Model API Key to GitHub Secrets

1. Go to repository Settings > Secrets and variables > Actions
2. Create a new secret:
   - **Name:** `COPILOT_MODEL_API_KEY`
   - **Value:** Your Copilot model API key

This key is passed to the agent via the `MODEL_API_KEY` environment variable.

### 3. Verify Workflow Configuration

The workflow includes three jobs:

#### Job 1: `parse-and-validate` (2 min timeout)

- Extracts the command from the comment using regex: `/oc\s+(.+)`
- Verifies the comment author has access (owner → collaborator → issue author)
- Outputs: `command`, `valid`, `should-run`

Access check order:
1. Is the comment author the issue creator? ✓ Can run
2. Is the comment author the repo owner? ✓ Can run
3. Is the comment author a collaborator with push/admin rights? ✓ Can run
4. Otherwise: ✗ Access denied

#### Job 2: `invoke-agent` (30 min timeout)

- Runs only if command is valid AND author has access
- Checks out the code with `persist-credentials: false`
- Sets up Node.js 24.22.2 (from `mise.toml`)
- Installs dependencies with `npm ci`
- Validates required agent configuration files
- Posts result comments on success/failure

#### Job 3: `notify-invalid` (2 min timeout)

- Handles invalid commands or access denied
- Posts an informative error message

## Usage

### Invoking the agent

In any GitHub issue, add a comment:

```
/oc explain this issue
```

The workflow will:
1. Parse your command
2. Check your access level
3. Execute the command
4. Post results as a reply comment

### Example commands

- `/oc explain this issue` — Explain the issue
- `/oc triage` — Triage the issue
- `/oc review-pr` — Review a pull request
- `/oc diagnose` — Diagnose a problem

## Monitoring Execution

1. **In the GitHub UI:** Go to the issue and look for reply comments from the bot
2. **In Actions:** Go to Actions tab and check the "Agent Invoke" workflow run
3. **Logs:** Click on the workflow run to see detailed execution logs

## Troubleshooting

### Workflow doesn't appear in Actions

- The workflow must be committed to the default branch (main/master)
- Wait 5-10 minutes for GitHub to index the new workflow file
- Check that the file is correctly named and in `.github/workflows/`

### "Permission denied" error

- Verify you have write access to the repository
- If using a fork, ensure the fork has write access to post comments
- Check that `persist-credentials: false` is set (security requirement)

### "Model API key not found" error

- Verify `COPILOT_MODEL_API_KEY` is added to repository secrets
- Check that the secret value is not empty
- Ensure the secret was saved (not just typed in the form)

### Timeout errors

- Agent execution timeout is 30 minutes
- If your command takes longer, consider breaking it into smaller tasks
- Check workflow logs to see what step exceeded the timeout

## Configuration Files

The agent uses configuration from `docs/agents/`:

- `issue-tracker.md` — GitHub Issues integration instructions
- `triage-labels.md` — Standard triage label definitions
- `domain.md` — Domain terminology and glossary reference

These files are automatically validated before the agent runs.

## Security Considerations

1. **Credentials:** `persist-credentials: false` prevents leaking GitHub tokens
2. **Access control:** Only trusted contributors can invoke agents
3. **API key:** Stored securely in GitHub Secrets, not in code
4. **Token scope:** Uses minimal required permissions
5. **OIDC:** Uses OIDC tokens for secure authentication

## Next Steps

1. Add `COPILOT_MODEL_API_KEY` to GitHub Secrets
2. Test with `/oc explain this issue` in an issue
3. Monitor the workflow run in Actions
4. Check agent reply comments on the issue
