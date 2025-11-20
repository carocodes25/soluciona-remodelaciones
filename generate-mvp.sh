#!/bin/bash

# ================================================================
# Soluciona Remodelaciones - Complete Project Generator
# ================================================================
# This script generates the complete MVP structure with all files
# Usage: chmod +x generate-mvp.sh && ./generate-mvp.sh
# ================================================================

set -e

echo "🚀 Soluciona Remodelaciones - MVP Generator"
echo "============================================"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ================================================================
# Helper Functions
# ================================================================

log_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

create_file() {
    local filepath="$1"
    local content="$2"
    
    mkdir -p "$(dirname "$filepath")"
    echo "$content" > "$filepath"
}

# ================================================================
# Backend Structure Generation
# ================================================================

generate_backend() {
    log_step "Generating Backend Structure..."
    
    cd "$ROOT_DIR"
    
    # Create all module directories
    for module in auth users pros categories jobs proposals contracts payments reviews search messaging admin files notifications audit; do
        mkdir -p "backend/src/modules/$module/dto"
        mkdir -p "backend/src/modules/$module/entities"
        log_success "Created module: $module"
    done
    
    # Create common directories
    mkdir -p backend/src/common/{guards,decorators,filters,interceptors,pipes,middlewares}
    mkdir -p backend/src/config
    mkdir -p backend/prisma
    mkdir -p backend/test/{unit,e2e}
    mkdir -p backend/uploads
    
    log_success "Backend directory structure created"
}

# ================================================================
# Frontend Structure Generation
# ================================================================

generate_frontend() {
    log_step "Generating Frontend Structure..."
    
    cd "$ROOT_DIR"
    
    # Create Next.js app directory structure
    mkdir -p frontend/app/\(auth\)/{login,register,verify-otp}
    mkdir -p frontend/app/\(public\)/{search,pros/[id],about}
    mkdir -p frontend/app/\(client\)/{dashboard,jobs,contracts,messages,profile}
    mkdir -p frontend/app/\(pro\)/{dashboard,onboarding,proposals,contracts,profile}
    mkdir -p frontend/app/\(admin\)/{dashboard,verifications,reviews,disputes,metrics}
    
    # Create component directories
    mkdir -p frontend/components/{layout,auth,pros,jobs,proposals,contracts,reviews,messaging,search,admin,onboarding,shared,payments}
    
    # Create lib directories
    mkdir -p frontend/lib/{api,hooks,utils,stores,types,constants}
    
    # Create public directories
    mkdir -p frontend/public/{images,icons}
    
    log_success "Frontend directory structure created"
}

# ================================================================
# Infrastructure Files
# ================================================================

generate_infra() {
    log_step "Generating Infrastructure Files..."
    
    mkdir -p infra/scripts
    mkdir -p infra/nginx
    mkdir -p docs/diagrams
    
    log_success "Infrastructure structure created"
}

# ================================================================
# Generate Essential Files
# ================================================================

generate_essential_files() {
    log_step "Generating essential configuration files..."
    
    # Backend tsconfig.build.json
    create_file "backend/tsconfig.build.json" '{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}'
    
    # Backend .eslintrc.js
    create_file "backend/.eslintrc.js" 'module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};'
    
    # Backend .prettierrc
    create_file "backend/.prettierrc" '{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}'
    
    # Frontend next.config.js
    create_file "frontend/next.config.js" '/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

module.exports = nextConfig;'
    
    # Frontend tailwind.config.js
    create_file "frontend/tailwind.config.js" '/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};'
    
    log_success "Essential configuration files created"
}

# ================================================================
# Main Execution
# ================================================================

main() {
    echo ""
    log_step "Starting MVP generation..."
    echo ""
    
    generate_backend
    echo ""
    
    generate_frontend
    echo ""
    
    generate_infra
    echo ""
    
    generate_essential_files
    echo ""
    
    log_success "✅ MVP Structure Generated Successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Install Backend Dependencies:"
    echo "   cd backend && npm install"
    echo ""
    echo "2. Generate Prisma Client:"
    echo "   npx prisma generate"
    echo ""
    echo "3. Run Database Migrations:"
    echo "   npx prisma migrate dev --name init"
    echo ""
    echo "4. Seed Database:"
    echo "   npx prisma db seed"
    echo ""
    echo "5. Install Frontend Dependencies:"
    echo "   cd ../frontend && npm install"
    echo ""
    echo "6. Start Development with Docker:"
    echo "   cd .. && docker-compose up -d"
    echo ""
    echo "7. Or start services individually:"
    echo "   Backend:  cd backend && npm run start:dev"
    echo "   Frontend: cd frontend && npm run dev"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📚 Documentation:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "• Complete roadmap: docs/IMPLEMENTATION_ROADMAP.md"
    echo "• Architecture: docs/ARCHITECTURE.md"
    echo "• API Docs: http://localhost:4000/api/docs (after start)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  Important:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "This script creates the directory structure. You still need to:"
    echo ""
    echo "• Implement all 15 backend modules (controllers, services, DTOs)"
    echo "• Create all frontend pages and components"
    echo "• Write seed data script"
    echo "• Implement tests"
    echo "• Configure integrations (KYC, Payments, Notifications)"
    echo ""
    echo "See docs/IMPLEMENTATION_ROADMAP.md for detailed instructions."
    echo ""
    echo "🎉 Happy Coding!"
    echo ""
}

# Run main function
main
