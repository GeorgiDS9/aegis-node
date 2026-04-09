#!/bin/bash

echo " ⬢ AEGIS NODE: SYSTEM PRE-FLIGHT CHECK"
echo "---------------------------------------"

# 1. Check for OrbStack/Docker
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker/OrbStack not found. Please install OrbStack."
    exit 1
else
    echo "✅ OrbStack/Docker is installed."
fi

# 2. Check if Docker Daemon is running
if ! docker info &> /dev/null; then
    echo "❌ ERROR: OrbStack is not running. Please launch it."
    exit 1
else
    echo "✅ OrbStack Daemon is active."
fi

# 3. Check for Ollama
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "❌ ERROR: Ollama is not responding on localhost:11434."
    echo "   Ensure the Ollama app is running in your Menu Bar."
    exit 1
else
    echo "✅ Ollama API is reachable."
fi

# 4. Check for the specific 4-bit model
MODEL="llama3:8b-instruct-q4_K_M"
if ! curl -s http://localhost:11434/api/tags | grep -q "$MODEL"; then
    echo "⚠️  WARNING: $MODEL not found locally."
    echo "   Running 'ollama pull $MODEL' now..."
    ollama pull $MODEL
else
    echo "✅ AI Model ($MODEL) is ready on M4."
fi

# 5. Check Directory Structure
echo "✅ Verifying project structure..."
mkdir -p data/vault lib src/app/aegis

echo "---------------------------------------"
echo "🚀 AEGIS SYSTEM READY FOR AGENT INITIALIZATION"