
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
    
    # Use .NET File.Exists to bypass Powershell wildcard issues with brackets in path
    if ([System.IO.File]::Exists($fullPath)) {
        Write-Host "Processing $name..."
        try {
            $image = [System.Drawing.Image]::FromFile($fullPath)
            
            $newWidth = 300
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
            Write-Host "Saved opt_$name"
        } catch {
            Write-Error "Failed to process $name : $_"
        }
    } else {
        Write-Warning "File not found: $fullPath"
    }
}
