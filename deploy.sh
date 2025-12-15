#!/usr/bin/env sh

# Stop the script immediately if any command fails
set -e

echo "Building Vue application..."
npm run build

# Navigate into the production output directory
cd dist

# Delete the temporary Git history created by previous failed runs
rm -rf .git

# Initialize a fresh Git repository
git init

# Create and switch to a local branch named 'main'
git checkout -b main

# Commit the built files
git add -A
git commit -m 'Deploy to GitHub Pages'

# Pushes the local 'main' branch (dist contents) to the remote 'gh-pages' branch.
echo "Pushing to gh-pages using 'main:gh-pages' bypass..."
git push -f git@github.com:bktrang/weather-app.git main:gh-pages

# Navigate back to the root of the project (required before end of script)
cd ..

echo "Deployment complete to https://bktrang.github.io/weather-app/"