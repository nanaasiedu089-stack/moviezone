param(
  [string]$RemoteUrl,
  [string]$Branch = 'main'
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error 'Git is not installed or not available in PATH. Install Git first.'
  exit 1
}

Push-Location "$PSScriptRoot"

if (-not (Test-Path .git)) {
  git init
  Write-Host 'Initialized a new Git repository.'
}

git add .
if (-not (git diff --cached --quiet)) {
  git commit -m 'Deploy MovieZone static site to GitHub Pages'
} else {
  Write-Host 'No changes to commit.'
}

$remote = git remote
if (-not $remote) {
  if (-not $RemoteUrl) {
    Write-Host 'No git remote configured. Provide a GitHub repository URL as the first argument.'
    Write-Host 'Example: .\deploy_github.ps1 https://github.com/yourname/moviezone.git'
    exit 1
  }
  git remote add origin $RemoteUrl
  Write-Host "Added remote origin: $RemoteUrl"
}

git branch -M $Branch

git push -u origin $Branch

Write-Host 'Done. If you want GitHub Pages, enable it on GitHub and use the root branch.'
Pop-Location
