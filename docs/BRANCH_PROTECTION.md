# Branch Protection

This repository uses automated branch protection configuration via the `.github/settings.yml` file.

## Protected Branches

The `main` branch is protected with the following rules:

### Protection Rules

1. **Pull Request Reviews Required**
   - At least 1 approving review is required before merging
   - Stale reviews are automatically dismissed when new commits are pushed

2. **Status Checks Required**
   - The "deploy" workflow must pass before merging
   - Branches must be up to date with the base branch

3. **Force Push Protection**
   - Force pushes to the main branch are not allowed
   - This prevents accidental overwrites of commit history

4. **Branch Deletion Protection**
   - The main branch cannot be deleted
   - This ensures the main branch is always available

5. **Administrator Enforcement**
   - These rules apply to all users, including administrators
   - No one can bypass these protections

## How to Apply

These settings are automatically applied using the Probot Settings app or similar GitHub Apps that read the `.github/settings.yml` file.

### Manual Setup (if needed)

If the settings file is not automatically applied, you can:

1. **Install the Probot Settings App**
   - Visit: https://github.com/apps/settings
   - Install it on your repository
   - The app will automatically apply settings from `.github/settings.yml`

2. **Manual Configuration via GitHub UI**
   - Go to repository Settings > Branches
   - Add a branch protection rule for `main`
   - Enable the following:
     - Require a pull request before merging
     - Require approvals (1)
     - Dismiss stale pull request approvals when new commits are pushed
     - Require status checks to pass before merging
     - Require branches to be up to date before merging
     - Status checks: `deploy`
     - Include administrators
   - Disable the following:
     - Allow force pushes
     - Allow deletions

## Benefits

- **Prevents Accidental Data Loss**: Force pushes and branch deletion are blocked
- **Code Quality**: All changes require review and passing tests
- **Consistent History**: Linear history is maintained
- **Team Collaboration**: Pull requests ensure code review and discussion

## More Information

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Probot Settings App](https://github.com/apps/settings)
