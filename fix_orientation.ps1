
Add-Type -AssemblyName System.Drawing

$images = @(
    "AADITHYAN.jpg", 
    "ARCHA.jpg", 
    "AMAN.jpg", 
    "neha s krishna.jpg", 
    "ABHIRAM.jpg", 
    "ARYA.jpg", 
    "ABHINAV.jpg", 
    "HAREESH.jpg", 
    "anjana-pradeep.jpg"
)

$sourceDir = 'c:\Users\anjan\OneDrive\Documents\ISTE-FRONTEND_-_Copy[1]\ISTE-FRONTEND - Copy\IMAGES'

foreach ($name in $images) {
    $fullPath = Join-Path $sourceDir $name
    
    if ([System.IO.File]::Exists($fullPath)) {
        Write-Host "Processing $name..."
        try {
            $image = [System.Drawing.Image]::FromFile($fullPath)
            
            # Check for Orientation Property (0x0112 = 274)
            if ($image.PropertyIdList -contains 274) {
                $prop = $image.GetPropertyItem(274)
                $val = $prop.Value[0]
                
                # Write-Host "Found orientation: $val"
                
                switch ($val) {
                    1 { } # Normal
                    2 { $image.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
                    3 { $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                    4 { $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
                    5 { $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
                    6 { $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                    7 { $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
                    8 { $image.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
                }
                
                # Remove the orientation tag so it doesn't get saved/confuse things later
                $image.RemovePropertyItem(274)
            }
            
            # Recalculate dimensions AFTER rotation
            # (If we rotated 90/270, Width/Height are swapped in the object now)
            
            $maxWidth = 300
            $newWidth = $maxWidth
            $newHeight = [int]($image.Height * ($newWidth / $image.Width))
            
            $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graph = [System.Drawing.Graphics]::FromImage($bitmap)
            $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graph.DrawImage($image, 0, 0, $newWidth, $newHeight)
            
            $newPath = Join-Path $sourceDir ("opt_" + $name)
            
            $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80)
            
            $bitmap.Save($newPath, $codec, $encoderParams)
            
            $image.Dispose()
            $bitmap.Dispose()
            $graph.Dispose()
            Write-Host "Corrected and Saved opt_$name"
        } catch {
            Write-Error "Failed to process $name : $_"
        }
    } else {
        Write-Warning "File not found: $fullPath"
    }
}
