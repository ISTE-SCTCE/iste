
Add-Type -AssemblyName System.Drawing

$targetDir = Resolve-Path ".\Gallery\launch event"
$quality = 75
$maxWidth = 1600

Write-Host "Target Directory: $targetDir"

$files = Get-ChildItem -Path $targetDir -Include *.jpg, *.jpeg, *.png -Recurse

foreach ($file in $files) {
    Write-Host "Processing $($file.Name)..."
    try {
        $image = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Calculate new dimensions
        $newWidth = $image.Width
        $newHeight = $image.Height
        
        if ($image.Width -gt $maxWidth) {
            $newWidth = $maxWidth
            $newHeight = [int]($image.Height * ($maxWidth / $image.Width))
            Write-Host "  Resizing from $($image.Width)x$($image.Height) to ${newWidth}x${newHeight}"
        } else {
            Write-Host "  No resizing needed (Width: $($image.Width))"
        }

        # Create new bitmap
        $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graph = [System.Drawing.Graphics]::FromImage($bitmap)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        $graph.DrawImage($image, 0, 0, $newWidth, $newHeight)
        
        # Setup Encoder
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        
        # Save to temp file
        $tempPath = $file.FullName + ".tmp.jpg"
        $bitmap.Save($tempPath, $codec, $encoderParams)
        
        # Cleanup Resources
        $image.Dispose()
        $bitmap.Dispose()
        $graph.Dispose()
        
        # Replace Original
        Remove-Item $file.FullName -Force
        
        # Rename tmp to original name (if it was jpg/jpeg). 
        # If it was png, we are converting to jpg, so we might need to change extension.
        # But for simplicity and to match gallery.html, let's keep original extension IF we can?
        # No, a PNG content inside a .png file should be PNG.
        # But here we encoded as JPEG.
        # If the original was PNG, let's actually just save as .jpg and I will have to update gallery.html.
        # BUT, looking at file list: 
        # DSC_0003.jpg, DSC_0009.jpg... WhatsApp...jpeg.
        # They are all jpg or jpeg. So saving as JPEG content in .jpg/.jpeg file is file.
        
        Move-Item $tempPath $file.FullName -Force
        
        $newSize = (Get-Item $file.FullName).Length
        Write-Host "  Optimized. New Size: $([math]::round($newSize/1KB, 2)) KB"
        
    } catch {
        Write-Error "Failed to process $($file.Name): $_"
    }
}
