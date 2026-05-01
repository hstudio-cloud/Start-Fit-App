#!/bin/bash
# =============================================================
# StartFit App — Script para subir ao GitHub
# =============================================================
# USO:
#   1. Crie um repositório vazio no GitHub chamado "Start-Fit-App"
#   2. Gere um Personal Access Token em:
#      https://github.com/settings/tokens/new
#      (scope: repo)
#   3. Execute:
#      chmod +x push-to-github.sh
#      ./push-to-github.sh SEU_USUARIO SEU_TOKEN
# =============================================================

GITHUB_USER=${1:-"seu-usuario"}
GITHUB_TOKEN=${2:-"ghp_seu_token"}
REPO_NAME="Start-Fit-App"

echo "🚀 Subindo StartFit App para o GitHub..."
echo "   Usuário: $GITHUB_USER"
echo "   Repositório: $REPO_NAME"

REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Código enviado com sucesso!"
  echo "🔗 https://github.com/${GITHUB_USER}/${REPO_NAME}"
else
  echo "❌ Erro ao enviar. Verifique usuário e token."
fi
