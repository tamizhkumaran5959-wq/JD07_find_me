Add-Type -AssemblyName System.Drawing
$src = "c:\Jegan\bg_for_memories.png"
$dest = "c:\Jegan\public\images\bg_for_memories.jpg"
$img = [System.Drawing.Image]::FromFile($src)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)
$img.Save($dest, $jpegCodec, $encoderParams)
$img.Dispose()
Write-Host "Done converting to JPEG. File size:"
(Get-Item $dest).Length
