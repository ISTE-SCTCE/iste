
Add-Type -AssemblyName System.Drawing

$path = Resolve-Path ".\IMAGES\ABHIRAM.jpg"
Write-Host "Fixing rotation for: $path"

try {
    $image = [System.Drawing.Image]::FromFile($path)
    
    # User says it is rotated +90 deg (CW). We need to rotate -90 deg (CCW).
    # In System.Drawing, Rotate270FlipNone corresponds to 270 deg CW, which is 90 deg CCW.
    $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone)
    
    # Save to temp
    $temp = $path.Path + ".tmp.jpg"
    
    # Use quality encoder
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 75)
    
    $image.Save($temp, $codec, $encoderParams)
    
    $image.Dispose()
    
    # Replace
    Remove-Item $path -Force
    Move-Item $temp $path -Force
    
    Write-Host "Successfully rotated ABHIRAM.jpg"
} catch {
    Write-Error "Failed to rotate: $_"
}
