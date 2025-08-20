# Setup Guide

This guide will help you set up the automated job listings repository.

## Files Overview

- `README.md` - The main file that displays job listings (auto-updated)
- `update-jobs.js` - Node.js script that fetches and parses the RSS feed
- `package.json` - Node.js project configuration
- `.github/workflows/update-jobs.yml` - GitHub Actions workflow for automation
- `.gitignore` - Files to exclude from version control

## Setup Instructions

### 1. Create Repository Structure

1. Open your `jobs` repository in VSCode
2. Create the following directory structure:
   ```
   jobs/
   ├── .github/
   │   └── workflows/
   │       └── update-jobs.yml
   ├── .gitignore
   ├── README.md
   ├── package.json
   ├── update-jobs.js
   └── SETUP.md (this file)
   ```

### 2. Add Files

Copy the content from each artifact into the corresponding files in your repository.

### 3. Test Locally (Optional)

If you want to test the script locally before pushing:

1. Open terminal in VSCode (`Terminal` → `New Terminal`)
2. Run: `node update-jobs.js`
3. Check if README.md gets updated with current jobs

### 4. Commit and Push

Using GitHub Desktop:
1. Open GitHub Desktop
2. Select your `jobs` repository
3. You should see all the new files in the changes list
4. Add a commit message like "Initial setup for automated job listings"
5. Commit to main
6. Push to origin

### 5. Verify GitHub Actions

1. Go to your repository on GitHub.com
2. Click on the "Actions" tab
3. You should see the workflow run automatically after pushing
4. The workflow will run daily at 6 AM UTC and update the README

## Manual Trigger

You can manually trigger the job update by:
1. Going to the Actions tab on GitHub
2. Clicking on "Update Job Listings" workflow
3. Clicking "Run workflow" button

## Troubleshooting

- If the workflow fails, check the Actions tab for error logs
- Make sure the repository has proper permissions for GitHub Actions
- The script filters jobs to only show those from the last 30 days

## Customization

To modify the update frequency:
- Edit the `cron` schedule in `.github/workflows/update-jobs.yml`
- Current: `'0 6 * * *'` (daily at 6 AM UTC)
- Example for twice daily: `'0 6,18 * * *'` (6 AM and 6 PM UTC)

To change the job age filter:
- Modify the number `30` in `update-jobs.js` (line with `thirtyDaysAgo.setDate`)
- Example for 2 weeks: change `30` to `14`