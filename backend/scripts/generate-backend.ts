#!/usr/bin/env ts-node

/**
 * Backend Code Generator for Soluciona Remodelaciones
 * 
 * This script generates all backend modules, services, controllers, DTOs, and configurations
 * following NestJS best practices and the project requirements.
 */

import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(__dirname, '..');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath: string, content: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf-8');
  console.log(`✓ Created ${filePath.replace(baseDir, '')}`);
}

// Common imports and decorators
const commonImports = {
  controller: `import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';`,
  
  service: `import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';`,
  
  dto: `import { IsString, IsEmail, IsInt, IsBoolean, IsOptional, IsEnum, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';`,
};

// Module definitions
const modules = [
  {
    name: 'auth',
    files: [
      'auth.module.ts',
      'auth.controller.ts',
      'auth.service.ts',
      'strategies/jwt.strategy.ts',
      'strategies/local.strategy.ts',
      'dto/register.dto.ts',
      'dto/login.dto.ts',
      'dto/refresh-token.dto.ts',
      'dto/verify-otp.dto.ts',
    ]
  },
  {
    name: 'users',
    files: [
      'users.module.ts',
      'users.controller.ts',
      'users.service.ts',
      'dto/create-user.dto.ts',
      'dto/update-user.dto.ts',
    ]
  },
  {
    name: 'pros',
    files: [
      'pros.module.ts',
      'pros.controller.ts',
      'pros.service.ts',
      'verification.service.ts',
      'dto/create-pro.dto.ts',
      'dto/update-pro.dto.ts',
      'dto/submit-verification.dto.ts',
      'dto/review-verification.dto.ts',
    ]
  },
  {
    name: 'categories',
    files: [
      'categories.module.ts',
      'categories.controller.ts',
      'categories.service.ts',
      'dto/create-category.dto.ts',
      'dto/update-category.dto.ts',
    ]
  },
  {
    name: 'jobs',
    files: [
      'jobs.module.ts',
      'jobs.controller.ts',
      'jobs.service.ts',
      'dto/create-job.dto.ts',
      'dto/update-job.dto.ts',
    ]
  },
  {
    name: 'proposals',
    files: [
      'proposals.module.ts',
      'proposals.controller.ts',
      'proposals.service.ts',
      'dto/create-proposal.dto.ts',
      'dto/accept-proposal.dto.ts',
    ]
  },
  {
    name: 'contracts',
    files: [
      'contracts.module.ts',
      'contracts.controller.ts',
      'contracts.service.ts',
      'milestones.service.ts',
      'dto/create-milestone.dto.ts',
      'dto/submit-evidence.dto.ts',
      'dto/approve-milestone.dto.ts',
    ]
  },
  {
    name: 'payments',
    files: [
      'payments.module.ts',
      'payments.controller.ts',
      'payments.service.ts',
      'adapters/payment-adapter.interface.ts',
      'adapters/stub-payment.adapter.ts',
      'adapters/wompi-payment.adapter.ts',
      'dto/create-payment.dto.ts',
      'dto/release-payment.dto.ts',
    ]
  },
  {
    name: 'reviews',
    files: [
      'reviews.module.ts',
      'reviews.controller.ts',
      'reviews.service.ts',
      'dto/create-review.dto.ts',
      'dto/moderate-review.dto.ts',
    ]
  },
  {
    name: 'search',
    files: [
      'search.module.ts',
      'search.controller.ts',
      'search.service.ts',
      'dto/search-pros.dto.ts',
    ]
  },
  {
    name: 'messaging',
    files: [
      'messaging.module.ts',
      'messaging.gateway.ts',
      'messaging.service.ts',
      'dto/send-message.dto.ts',
    ]
  },
  {
    name: 'admin',
    files: [
      'admin.module.ts',
      'admin.controller.ts',
      'admin.service.ts',
      'metrics.service.ts',
      'dto/admin-stats.dto.ts',
    ]
  },
  {
    name: 'files',
    files: [
      'files.module.ts',
      'files.controller.ts',
      'files.service.ts',
    ]
  },
  {
    name: 'notifications',
    files: [
      'notifications.module.ts',
      'notifications.service.ts',
      'adapters/notification-adapter.interface.ts',
      'adapters/stub-notification.adapter.ts',
    ]
  },
  {
    name: 'audit',
    files: [
      'audit.module.ts',
      'audit.service.ts',
    ]
  },
];

// Common guards, decorators, filters
const commonFiles = [
  'common/guards/jwt-auth.guard.ts',
  'common/guards/roles.guard.ts',
  'common/decorators/roles.decorator.ts',
  'common/decorators/current-user.decorator.ts',
  'common/filters/http-exception.filter.ts',
  'common/interceptors/logging.interceptor.ts',
];

function generateModule(moduleName: string) {
  const className = moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Module';
  const serviceName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Service';
  const controllerName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Controller';

  return `import { Module } from '@nestjs/common';
import { ${controllerName} } from './${moduleName}.controller';
import { ${serviceName} } from './${moduleName}.service';

@Module({
  controllers: [${controllerName}],
  providers: [${serviceName}],
  exports: [${serviceName}],
})
export class ${className} {}
`;
}

function generateController(moduleName: string) {
  const className = moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Controller';
  const serviceName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Service';

  return `${commonImports.controller}
import { ${serviceName} } from './${moduleName}.service';

@ApiTags('${moduleName}')
@Controller('${moduleName}')
export class ${className} {
  constructor(private readonly ${moduleName}Service: ${serviceName}) {}

  @Get()
  @ApiOperation({ summary: 'Get all ${moduleName}' })
  findAll() {
    return this.${moduleName}Service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${moduleName} by ID' })
  findOne(@Param('id') id: string) {
    return this.${moduleName}Service.findOne(id);
  }
}
`;
}

function generateService(moduleName: string) {
  const className = moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Service';

  return `${commonImports.service}

@Injectable()
export class ${className} {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // TODO: Implement
    return [];
  }

  async findOne(id: string) {
    // TODO: Implement
    return {};
  }
}
`;
}

// Generate common files
function generateCommonFiles() {
  // JWT Guard
  writeFile(path.join(baseDir, 'src/common/guards/jwt-auth.guard.ts'), `
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
  `);

  // Roles Guard
  writeFile(path.join(baseDir, 'src/common/guards/roles.guard.ts'), `
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
  `);

  // Roles Decorator
  writeFile(path.join(baseDir, 'src/common/decorators/roles.decorator.ts'), `
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
  `);

  // Current User Decorator
  writeFile(path.join(baseDir, 'src/common/decorators/current-user.decorator.ts'), `
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
  `);

  // HTTP Exception Filter
  writeFile(path.join(baseDir, 'src/common/filters/http-exception.filter.ts'), `
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
  `);
}

// Main generation function
function generateAll() {
  console.log('🚀 Generating Soluciona Remodelaciones Backend...\n');

  // Generate common files
  console.log('📁 Generating common files...');
  generateCommonFiles();

  // Generate module files
  for (const module of modules) {
    console.log(`\n📦 Generating ${module.name} module...`);
    
    const moduleDir = path.join(baseDir, 'src/modules', module.name);
    
    // Generate basic module structure
    writeFile(path.join(moduleDir, `${module.name}.module.ts`), generateModule(module.name));
    
    if (module.files.includes(`${module.name}.controller.ts`)) {
      writeFile(path.join(moduleDir, `${module.name}.controller.ts`), generateController(module.name));
    }
    
    if (module.files.includes(`${module.name}.service.ts`)) {
      writeFile(path.join(moduleDir, `${module.name}.service.ts`), generateService(module.name));
    }
  }

  console.log('\n✅ Backend structure generated successfully!');
  console.log('\nNext steps:');
  console.log('1. cd backend');
  console.log('2. npm install');
  console.log('3. npx prisma generate');
  console.log('4. npx prisma migrate dev');
  console.log('5. npm run start:dev');
}

// Run generator
if (require.main === module) {
  generateAll();
}

export { generateAll };
