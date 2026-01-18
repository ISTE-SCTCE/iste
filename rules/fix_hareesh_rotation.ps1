
Add-Type -AssemblyName System.Drawing

$path = Resolve-Path ".\IMAGES\HAREESH.jpg"
Write-Host "Fixing rotation for: $path"

try {
    $image = [System.Drawing.Image]::FromFile($path)
    
    # Rotate 90 degrees clockwise (Assuming -90 means it's 90 deg CCW, so we need +90 CW)
    $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
    
    # Save to temp
    $temp = $path.Path + ".tmp.jpg"
    
    # Use quality encoder to avoid re-compression artifacts if possible, or just default save
    # Re-using the encoder logic from optimize script to maintain quality setting
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 75)
    
    $image.Save($temp, $codec, $encoderParams)
    
    $image.Dispose()
    
    # Replace
    Remove-Item $path -Force
    Move-Item $temp $path -Force
    
    Write-Host "Successfully rotated HAREESH.jpg"
} catch {
    Write-Error "Failed to rotate: $_"
}
