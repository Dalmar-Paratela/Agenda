param(
  [Parameter(Mandatory = $true)]
  [string]$Message
)

git add .
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git push
exit $LASTEXITCODE
