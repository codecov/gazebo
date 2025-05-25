export const windowsSystemInstructions = `$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri https://keybase.io/codecovsecurity/pgp_keys.asc -OutFile codecov.asc 
gpg.exe --import codecov.asc

Invoke-WebRequest -Uri https://cli.codecov.io/latest/windows/codecov.exe -Outfile codecov.exe
Invoke-WebRequest -Uri https://cli.codecov.io/latest/windows/codecov.exe.SHA256SUM -Outfile codecov.exe.SHA256SUM
Invoke-WebRequest -Uri https://cli.codecov.io/latest/windows/codecov.exe.SHA256SUM.sig -Outfile codecov.exe.SHA256SUM.sig

gpg.exe --verify codecov.exe.SHA256SUM.sig codecov.exe.SHA256SUM
If ($(Compare-Object -ReferenceObject  $(($(certUtil -hashfile codecov.exe SHA256)[1], "codecov.exe") -join "  ") -DifferenceObject $(Get-Content codecov.exe.SHA256SUM)).length -eq 0) { echo "SHASUM verified" } Else {exit 1}
`

export const macOSSystemInstructions = `curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/macos/codecov
curl -Os https://cli.codecov.io/latest/macos/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/macos/codecov.SHA256SUM.sig
gpg --verify codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM 
sudo chmod +x codecov
./codecov --help
`

export const linuxSystemInstructions = `curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/linux/codecov
curl -Os https://cli.codecov.io/latest/linux/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/linux/codecov.SHA256SUM.sig
gpg --verify codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM
sudo chmod +x codecov
./codecov --help
`

export const alpineLinuxSystemInstructions = `curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/alpine/codecov
curl -Os https://cli.codecov.io/latest/alpine/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/alpine/codecov.SHA256SUM.sig
gpg --verify codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM
sudo chmod +x codecov
./codecov --help
`

export const linuxArm64SystemInstructions = `curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/linux-arm64/codecov
curl -Os https://cli.codecov.io/latest/linux-arm64/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/linux-arm64/codecov.SHA256SUM.sig
gpg --verify codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM
sudo chmod +x codecov
./codecov --help
`

export const alpineLinuxArm64Instructions = `curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step
curl -Os https://cli.codecov.io/latest/alpine-arm64/codecov
curl -Os https://cli.codecov.io/latest/alpine-arm64/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/alpine-arm64/codecov.SHA256SUM.sig
gpg --verify codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM
sudo chmod +x codecov
./codecov --help
`
