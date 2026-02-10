$baseUrl = "http://localhost:3000/api/auth"
$apiUrl = "http://localhost:3000/api"

Write-Host "1. Verificando existência de Encarregado..."
try {
    $check = Invoke-RestMethod -Uri "$baseUrl/check-encarregado" -Method GET
    Write-Host "Status Exists: $($check.exists)"
} catch {
    Write-Host "Erro ao verificar encarregado: $_"
    exit 1
}

try {
    $insts = Invoke-RestMethod -Uri "$apiUrl/instrumentos" -Method GET
    if ($insts.Count -eq 0) {
        Write-Host "Erro: Nenhum instrumento encontrado."
        exit 1
    }
    $instId = $insts[0].id
    Write-Host "Instrumento selecionado: $($insts[0].nome) ($instId)"
} catch {
    Write-Host "Erro ao buscar instrumentos: $_"
    exit 1
}

$encarregadoPayload = @{
    nome = "Teste Encarregado"
    email = "teste.encarregado@gem.com.br"
    senha = "password123"
    confirmarSenha = "password123"
    telefone = "11999999999"
    congregacao = "Jardim dos Ipês"
    instrumentos = @($instId)
    role = "ENCARREGADO"
} | ConvertTo-Json

if ($check.exists) {
    Write-Host "2. Encarregado já existe. Tentando registrar um segundo (Esperado: Falha)..."
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body $encarregadoPayload -ContentType "application/json"
        Write-Host "FALHA: Segundo encarregado registrado com sucesso! (Isso é um erro)"
    } catch {
        if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::BadRequest) {
             # Read error body
             $stream = $_.Exception.Response.GetResponseStream()
             $reader = New-Object System.IO.StreamReader($stream)
             $body = $reader.ReadToEnd()
             Write-Host "SUCESSO: Bloqueio funcionando. Resposta: $body"
        } else {
             Write-Host "ERRO INESPERADO: $_"
        }
    }
} else {
    Write-Host "2. Nenhum Encarregado. Tentando registrar o primeiro (Esperado: Sucesso)..."
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body $encarregadoPayload -ContentType "application/json"
        Write-Host "SUCESSO: Encarregado registrado."
        
        Write-Host "3. Agora tentando registrar um segundo (Esperado: Falha)..."
        try {
             $res2 = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body $encarregadoPayload -ContentType "application/json"
             Write-Host "FALHA: Segundo encarregado registrado!"
        } catch {
             if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::BadRequest) {
                 Write-Host "SUCESSO: Bloqueio do segundo encarregado funcionando."
             } else {
                 Write-Host "ERRO INESPERADO no segundo registro: $_"
             }
        }

    } catch {
        Write-Host "ERRO ao registrar encarregado: $_"
        if ($_.Exception.Response) {
             $stream = $_.Exception.Response.GetResponseStream()
             $reader = New-Object System.IO.StreamReader($stream)
             $body = $reader.ReadToEnd()
             Write-Host "Detalhes: $body"
        }
    }
}
