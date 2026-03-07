#!/bin/bash

run_command() {
  echo "| - - - - - - - - |"
  echo "Executando: $1"
  echo "| - - - - - - - - |"
  eval "$1"
  if [ $? -ne 0 ]; then
    echo "Erro ao executar: $1"
    echo "FUDEU"
    exit 1
  fi
  echo ""
}

run_command "npm install"
run_command "npx prisma generate"
run_command "npx prisma db push"
run_command "npx prisma db seed"
run_command "npm run build"
run_command "npm run dev"