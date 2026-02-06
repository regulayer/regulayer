try {
    $body = Get-Content payload.json -Raw
    $response = Invoke-RestMethod -Uri "http://localhost:8300/v1/decisions" -Method Post -Body $body -ContentType "application/json" -Headers @{"X-Regulayer-Project-Id"="global"; "X-Regulayer-Environment"="prod"}
    Write-Host "Success: $($response | ConvertTo-Json)"
} catch {
    Write-Host "Error Code: $($_.Exception.Response.StatusCode)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response Body: $responseBody"
}
