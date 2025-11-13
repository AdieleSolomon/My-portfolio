Write-Host "🚀 Deploying portfolio updates..." -ForegroundColor Cyan
Remove-Item vercel.json -Force -ErrorAction SilentlyContinue
git add .
git commit -m "Portfolio update $(Get-Date -Format 'yyyy-MM-dd')"
git push origin main
vercel --prod
Write-Host "✅ Deployment complete!" -ForegroundColor Green
