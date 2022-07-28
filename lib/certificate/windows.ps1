$storePath = "Cert:\CurrentUser\Root";
$store=Get-Item $storePath;
Get-ChildItem $storePath -DnsName *share-file* | Remove-Item -Force;
$certs1=Get-Content "lib\certificate\share-file-root.crt";
$certs2=Get-Content "lib\certificate\share-file-ca.crt";
$certs3=Get-Content "lib\certificate\share-file.crt";
$certs = $certs1 + "`n" + $certs2 + "`n" + $certs3;
$header = "-----BEGIN CERTIFICATE-----";
$footer = "-----END CERTIFICATE-----";
$match_string = "(?s)$header(.*?)$footer";
$certs_matches = Select-String $match_string -input $certs -AllMatches;
$base64=$certs_matches.matches | ForEach-Object{ $_.Groups[1].Value };
$bytes=$base64 | ForEach-Object{ ,[System.Text.Encoding]::UTF8.GetBytes($_) };
$store.Open("ReadWrite");
foreach ($c in $bytes) {
    $cert = new-object System.Security.Cryptography.X509Certificates.X509Certificate2(,$c);
    $store.Add($cert);
}
$store.add($cert);
$store.Close();