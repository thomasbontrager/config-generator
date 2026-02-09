# GitHub Branch Protection Rulesets

This directory contains a template for GitHub branch protection rulesets that help protect your most important branches.

## What are Branch Protection Rulesets?

Branch protection rulesets allow you to define rules that:
- Prevent force pushes to protected branches
- Prevent branch deletion
- Require linear commit history
- Require signed commits
- Require pull request reviews before merging
- Require status checks to pass before merging

## Files Included

- `branch-protection-ruleset.json` - A comprehensive branch protection ruleset template

## How to Use

1. Navigate to your GitHub repository
2. Go to Settings → Rules → Rulesets
3. Click "New branch ruleset"
4. You can either:
   - Manually configure the rules using the UI
   - Use the GitHub API to import the JSON configuration

### Using the GitHub API

To create a ruleset using the API:

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/rulesets \
  -d @branch-protection-ruleset.json
```

## Configuration Details

### Protected Branches
By default, this ruleset protects:
- `main` branch
- `master` branch

### Rules Enabled
- **Deletion protection**: Prevents branch deletion
- **Force push prevention**: Prevents force pushes and history rewrites
- **Linear history**: Requires linear commit history (no merge commits)
- **Signed commits**: Requires commits to be signed
- **Pull request reviews**: Requires 1 approving review before merging
- **Status checks**: Requires CI/build and CI/test checks to pass

### Customization

Modify the `branch-protection-ruleset.json` file to:
- Change protected branch names in `conditions.ref_name.include`
- Adjust required approving review count
- Add or remove required status checks
- Configure bypass actors (users/teams that can bypass rules)

## Learn More

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub REST API - Rulesets](https://docs.github.com/en/rest/repos/rules)
