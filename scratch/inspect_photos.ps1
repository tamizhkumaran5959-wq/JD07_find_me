Add-Type -AssemblyName System.Drawing
Get-ChildItem -Path 'c:\Jegan\photos\*.jpg' | Sort-Object { [int]($_.BaseName) } | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    [PSCustomObject]@{
        Name = $_.Name
        Width = $img.Width
        Height = $img.Height
        AspectRatio = [math]::Round($img.Width / $img.Height, 2)
        Orientation = if ($img.Width -gt $img.Height) { 'Landscape' } elseif ($img.Height -gt $img.Width) { 'Portrait' } else { 'Square' }
        SizeKB = [math]::Round($_.Length / 1024, 1)
    }
    $img.Dispose()
} | Format-Table -AutoSize
