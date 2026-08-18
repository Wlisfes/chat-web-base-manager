[CmdletBinding()]
param(
    [string]$Domain = 'chat.lisfes.com',
    [string]$Distro = 'Ubuntu-22.04',
    [string]$LinuxDeployPath = '/opt/chat-web-base-manager',
    [string]$RunnerUser = 'github-runner'
)

$ErrorActionPreference = 'Stop'

if ($Domain -notmatch '^[A-Za-z0-9.-]+$') {
    throw 'Domain contains unsupported characters.'
}

if ($Distro -notmatch '^[A-Za-z0-9._-]+$') {
    throw 'Distro contains unsupported characters.'
}

if ($LinuxDeployPath -notmatch '^/[A-Za-z0-9._/-]+$') {
    throw 'LinuxDeployPath must be an absolute Linux path.'
}

if ($RunnerUser -notmatch '^[A-Za-z_][A-Za-z0-9_-]*$') {
    throw 'RunnerUser contains unsupported characters.'
}

$principal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this script from an elevated PowerShell session so it can update the Windows hosts file.'
}

$certificateDirectory = "$LinuxDeployPath/certs"
$certificatePath = "$certificateDirectory/$Domain.crt"
$privateKeyPath = "$certificateDirectory/$Domain.key"
$opensslCommand = @"
set -eu
id '$RunnerUser' >/dev/null 2>&1
install -d -o '$RunnerUser' -g '$RunnerUser' -m 0755 '$LinuxDeployPath'
install -d -o '$RunnerUser' -g '$RunnerUser' -m 0700 '$certificateDirectory'
if ! { [ -s '$certificatePath' ] && [ -s '$privateKeyPath' ] && openssl x509 -checkend 86400 -noout -in '$certificatePath'; }; then
    openssl req -x509 -nodes -newkey rsa:2048 -sha256 -days 825 \
        -subj '/CN=$Domain' \
        -addext 'subjectAltName=DNS:$Domain' \
        -addext 'basicConstraints=critical,CA:FALSE' \
        -addext 'keyUsage=critical,digitalSignature,keyEncipherment' \
        -addext 'extendedKeyUsage=serverAuth' \
        -keyout '$privateKeyPath' \
        -out '$certificatePath' >/dev/null 2>&1
fi
chown '${RunnerUser}:${RunnerUser}' '$certificatePath' '$privateKeyPath'
chmod 0600 '$privateKeyPath'
chmod 0644 '$certificatePath'
"@

& wsl.exe -d $Distro -u root -e sh -lc $opensslCommand
if ($LASTEXITCODE -ne 0) {
    throw 'Failed to create the local HTTPS certificate in WSL.'
}

$temporaryCertificate = Join-Path ([IO.Path]::GetTempPath()) "$Domain-$PID.crt"
try {
    $certificatePem = (& wsl.exe -d $Distro -u root -e cat $certificatePath) -join "`n"
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($certificatePem)) {
        throw 'Failed to read the generated certificate from WSL.'
    }
    [IO.File]::WriteAllText($temporaryCertificate, "$certificatePem`n", [Text.UTF8Encoding]::new($false))

    $certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new($temporaryCertificate)
    $store = [Security.Cryptography.X509Certificates.X509Store]::new(
        [Security.Cryptography.X509Certificates.StoreName]::Root,
        [Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser
    )
    $store.Open([Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    try {
        if (-not ($store.Certificates | Where-Object Thumbprint -EQ $certificate.Thumbprint)) {
            $store.Add($certificate)
        }
    } finally {
        $store.Close()
    }
} finally {
    Remove-Item -LiteralPath $temporaryCertificate -Force -ErrorAction SilentlyContinue
}

$hostsPath = Join-Path $env:SystemRoot 'System32\drivers\etc\hosts'
$hostsFile = Get-Item -LiteralPath $hostsPath
$hostsWasReadOnly = $hostsFile.IsReadOnly
try {
    if ($hostsWasReadOnly) {
        $hostsFile.IsReadOnly = $false
    }
    $hostsLines = [IO.File]::ReadAllLines($hostsPath)
    $domainPattern = "(?i)^\s*127\.0\.0\.1\s+.*(?:\s|^)$([regex]::Escape($Domain))(?:\s|$)"
    if (-not ($hostsLines | Where-Object { $_ -match $domainPattern })) {
        [IO.File]::AppendAllText($hostsPath, "`r`n127.0.0.1`t$Domain`r`n", [Text.UTF8Encoding]::new($false))
    }
} finally {
    if ($hostsWasReadOnly) {
        (Get-Item -LiteralPath $hostsPath).IsReadOnly = $true
    }
}

Write-Output "Configured https://$Domain with a CurrentUser trusted local certificate."
