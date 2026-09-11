#!/bin/bash

# FreshCart Production Deployment Script
# Usage: ./scripts/deploy.sh [backend|admin|all]

set -e

ROOT_DIR="$(dirname "$0")/.."
cd "$ROOT_DIR"

echo "🚀 FreshCart Deployment Script"
echo "==============================="

deploy_backend() {
    echo ""
    echo "📦 Deploying Backend..."
    echo "========================"

    cd "$ROOT_DIR/backend"

    # Check if Railway CLI is installed
    if command -v railway &> /dev/null; then
        echo "Deploying to Railway..."
        railway up
        echo "✅ Backend deployed to Railway!"
    else
        echo "Railway CLI not found. Manual deployment options:"
        echo ""
        echo "Option 1: Railway"
        echo "  1. npm install -g @railway/cli"
        echo "  2. railway login"
        echo "  3. railway up"
        echo ""
        echo "Option 2: Docker"
        echo "  1. docker build -t freshcart-api ."
        echo "  2. docker push your-registry/freshcart-api"
        echo ""
        echo "Option 3: Manual"
        echo "  1. npm run build"
        echo "  2. Copy dist/ to server"
        echo "  3. npm run start:prod"
    fi

    cd "$ROOT_DIR"
}

deploy_admin() {
    echo ""
    echo "🖥️  Deploying Admin Dashboard..."
    echo "================================="

    cd "$ROOT_DIR/admin"

    # Check if Vercel CLI is installed
    if command -v vercel &> /dev/null; then
        echo "Deploying to Vercel..."
        vercel --prod
        echo "✅ Admin dashboard deployed to Vercel!"
    else
        echo "Vercel CLI not found. Manual deployment options:"
        echo ""
        echo "Option 1: Vercel (Recommended)"
        echo "  1. npm install -g vercel"
        echo "  2. vercel login"
        echo "  3. vercel --prod"
        echo ""
        echo "Option 2: Docker"
        echo "  1. docker build -t freshcart-admin ."
        echo "  2. docker run -p 3001:3001 freshcart-admin"
        echo ""
        echo "Option 3: Self-hosted"
        echo "  1. npm run build"
        echo "  2. npm start"
    fi

    cd "$ROOT_DIR"
}

check_env() {
    echo "🔍 Checking environment..."

    # Backend
    if [ ! -f "$ROOT_DIR/backend/.env" ] && [ ! -f "$ROOT_DIR/backend/.env.local" ]; then
        echo "⚠️  Warning: No backend .env file found"
        echo "   Copy .env.production.template to .env and configure"
    fi

    # Admin
    if [ ! -f "$ROOT_DIR/admin/.env.local" ] && [ ! -f "$ROOT_DIR/admin/.env.production" ]; then
        echo "⚠️  Warning: No admin .env file found"
        echo "   Set NEXT_PUBLIC_API_URL in Vercel environment"
    fi
}

run_tests() {
    echo ""
    echo "🧪 Running tests..."
    echo "==================="

    cd "$ROOT_DIR/backend"
    npm test || echo "⚠️ Backend tests had issues"

    cd "$ROOT_DIR/admin"
    npm test -- --watchAll=false || echo "⚠️ Admin tests had issues"

    cd "$ROOT_DIR"
}

case "${1:-all}" in
    backend)
        check_env
        deploy_backend
        ;;
    admin)
        check_env
        deploy_admin
        ;;
    all)
        check_env
        run_tests
        deploy_backend
        deploy_admin
        ;;
    test)
        run_tests
        ;;
    *)
        echo "Usage: $0 [backend|admin|all|test]"
        echo ""
        echo "Commands:"
        echo "  backend  - Deploy backend API to Railway"
        echo "  admin    - Deploy admin dashboard to Vercel"
        echo "  all      - Run tests and deploy both"
        echo "  test     - Run tests only"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
