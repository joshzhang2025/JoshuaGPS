# Assembles the Capacitor web asset directory (www/) from the project root.
# You keep editing files at the root; this copies only the web assets into www/,
# which is what `npx cap sync` then bundles into the native app.

$root = $PSScriptRoot
$dest = Join-Path $root 'www'

# Folders that must never be copied into the app bundle.
$excludeDirs = @(
  (Join-Path $root 'node_modules'),
  (Join-Path $root 'www'),
  (Join-Path $root 'ios'),
  (Join-Path $root 'android'),
  (Join-Path $root '.git'),
  (Join-Path $root '.claude'),
  (Join-Path $root 'server-config')
)

# Root-level files that are tooling/docs, not web assets.
$excludeFiles = @(
  '*.py', '*.cmd', '*.zip', '*.ps1',
  'capacitor.config.json', 'package.json', 'package-lock.json'
)

robocopy $root $dest /MIR /XD $excludeDirs /XF $excludeFiles /NFL /NDL /NJH /NJS /NP | Out-Null

# robocopy exit codes 0-7 are success (8+ are real errors).
if ($LASTEXITCODE -ge 8) {
  Write-Error "build-www: robocopy failed with code $LASTEXITCODE"
  exit $LASTEXITCODE
}
Write-Host "build-www: web assets copied to $dest"
exit 0
