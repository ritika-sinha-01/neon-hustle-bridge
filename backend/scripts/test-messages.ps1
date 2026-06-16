# HustleBridge — Messaging REST API smoke tests (PowerShell)
# Prerequisites: backend running on http://localhost:4000, db seeded (npm run db:seed)

$BaseUrl = "http://localhost:4000/api/v1"
$StudentEmail = "arjun@hustlebridge.dev"
$ClientEmail = "techlearn@hustlebridge.dev"
$Password = "Password1"

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [hashtable]$Body = $null,
    [string]$Token = $null
  )

  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }

  $uri = "$BaseUrl$Path"
  $params = @{
    Method     = $Method
    Uri        = $uri
    Headers    = $headers
    ErrorAction = "Stop"
  }

  if ($Body) {
    $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
  }

  $response = Invoke-RestMethod @params
  return $response
}

Write-Host "`n=== 1. Login as student ===" -ForegroundColor Cyan
$studentLogin = Invoke-Api -Method POST -Path "/auth/login" -Body @{
  email    = $StudentEmail
  password = $Password
}
$studentToken = $studentLogin.data.tokens.accessToken
$studentId = $studentLogin.data.user.id
Write-Host "Student ID: $studentId"

Write-Host "`n=== 2. Login as client ===" -ForegroundColor Cyan
$clientLogin = Invoke-Api -Method POST -Path "/auth/login" -Body @{
  email    = $ClientEmail
  password = $Password
}
$clientToken = $clientLogin.data.tokens.accessToken
$clientId = $clientLogin.data.user.id
Write-Host "Client ID: $clientId"

Write-Host "`n=== 3. GET /messages/conversations (student) ===" -ForegroundColor Cyan
$conversations = Invoke-Api -Method GET -Path "/messages/conversations" -Token $studentToken
$conversations | ConvertTo-Json -Depth 8

Write-Host "`n=== 4. POST /messages/conversations (student -> client) ===" -ForegroundColor Cyan
$newConversation = Invoke-Api -Method POST -Path "/messages/conversations" -Token $studentToken -Body @{
  participantId  = $clientId
  initialMessage = "Hi! I'd love to discuss the website project."
}
$newConversation | ConvertTo-Json -Depth 8
$conversationId = $newConversation.data.conversation.id

Write-Host "`n=== 5. GET /messages/conversations/:conversationId ===" -ForegroundColor Cyan
$thread = Invoke-Api -Method GET -Path "/messages/conversations/$conversationId" -Token $studentToken
$thread | ConvertTo-Json -Depth 8

Write-Host "`n=== 6. POST /messages/conversations/:conversationId/messages (client) ===" -ForegroundColor Cyan
$sent = Invoke-Api -Method POST -Path "/messages/conversations/$conversationId/messages" -Token $clientToken -Body @{
  content = "Thanks for reaching out! When can we schedule a call?"
}
$sent | ConvertTo-Json -Depth 8

Write-Host "`n=== 7. PATCH /messages/conversations/:conversationId/read (student) ===" -ForegroundColor Cyan
$read = Invoke-Api -Method PATCH -Path "/messages/conversations/$conversationId/read" -Token $studentToken
$read | ConvertTo-Json -Depth 8

Write-Host "`n=== 8. GET /notifications (client — offline message alerts) ===" -ForegroundColor Cyan
$notifications = Invoke-Api -Method GET -Path "/notifications" -Token $clientToken
$notifications.data.notifications | ConvertTo-Json -Depth 8

Write-Host "`n=== All messaging REST tests completed ===" -ForegroundColor Green
