export const windowsSystemInstructions = `# download Codecov CLI
$ProgressPreference = 'SilentlyContinue' 
Invoke-WebRequest -Uri https://cli.codecov.io/latest/windows/codecov.exe 
-Outfile codecov.exe .\\codecov.exe

# integrity check
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri https://keybase.io/codecovsecurity/pgp_keys.asc -OutFile codecov.asc 
gpg.exe --import codecov.asc

Invoke-WebRequest -Uri https://cli.codecov.io/latest/windows/codecov.exe -Outfile codecov.exe
Invoke-WebRequest -Uri https://cli.codecov.io/latest/windows/codecov.exe.SHA256SUM -Outfile codecov.exe.SHA256SUM
Invoke-WebRequest -Uri https://cli.codecov.io/latest/windows/codecov.exe.SHA256SUM.sig -Outfile codecov.exe.SHA256SUM.sig

gpg.exe --verify codecov.exe.SHA256SUM.sig codecov.exe.SHA256SUM
If ($(Compare-Object -ReferenceObject  $(($(certUtil -hashfile codecov.exe SHA256)[1], "codecov.exe") -join "  ") -DifferenceObject
$(Get-Content codecov.exe.SHA256SUM)).length -eq 0) { echo "SHASUM verified" } Else {exit 1}
`

export const macOSSystemInstructions = `# download Codecov CLI
curl -Os https://cli.codecov.io/latest/macos/codecov

# integrity check
curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/macos/codecov
curl -Os https://cli.codecov.io/latest/macos/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/macos/codecov.SHA256SUM.sig
gpgv codecov.SHA256SUM.sig codecov.SHA256SUM
shasum -a 256 -c codecov.SHA256SUM 
sudo chmod +x codecov
./codecov --help
`

export const linuxSystemInstructions = `# download Codecov CLI
curl -Os https://cli.codecov.io/latest/linux/codecov

# integrity check
curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/linux/codecov
curl -Os https://cli.codecov.io/latest/linux/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/linux/codecov.SHA256SUM.sig
gpgv codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM
sudo chmod +x codecov
./codecov --help
`

export const aplineLinuxSystemInstructions = `# download Codecov CLI
curl -Os https://cli.codecov.io/latest/alpine/codecov

# integrity check
curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/alpine/codecov
curl -Os https://cli.codecov.io/latest/alpine/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/alpine/codecov.SHA256SUM.sig
gpgv codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM
sudo chmod +x codecov
./codecov --help
`

export const selfHostedSystemInstructions = `# here we'll upload the test report called  coverage-service.xml, we are passing 
# in the flag called "service" and a dyncamic name  to specify a specifc test run
# we are using some options params like --verbose and --fail-on-error
# the most important that you must pass in this case is the actual upload token
# NOTE: we're adding a parameter for the self-hosted URL

./codecov --verbose --enterprise-url https://<your-codecov-self-hosted-url> upload-process --fail-on-error -t \${{ secrets.CODECOV_TOKEN }}
-n 'service'-\${{ github.run_id }} -F service -f coverage-service.xml`
