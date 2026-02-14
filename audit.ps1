$root = Get-Location
$outFile = Join-Path $root "unterverzeichnisse.txt"

Get-ChildItem -Path $root -Directory -Recurse |
Where-Object {
    $_.FullName -notmatch '\\node_modules(\\|$)'
} |
Select-Object -ExpandProperty FullName |
Out-File -FilePath $outFile -Encoding UTF8

Write-Host "Gespeichert in $outFile"
