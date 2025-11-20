import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { FilesService } from './files.service';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['image', 'document', 'video'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
    @Query('type') type?: 'image' | 'document' | 'video',
  ) {
    return this.filesService.uploadFile(file, userId, type || 'image');
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple files (max 10)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        type: {
          type: 'string',
          enum: ['image', 'document', 'video'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files' })
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('userId') userId: string,
    @Query('type') type?: 'image' | 'document' | 'video',
  ) {
    return this.filesService.uploadFiles(files, userId, type || 'image');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiResponse({ status: 200, description: 'File found' })
  @ApiResponse({ status: 404, description: 'File not found' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get files uploaded by current user' })
  @ApiQuery({ name: 'type', required: false, enum: ['image', 'document', 'video'] })
  @ApiResponse({ status: 200, description: 'Files list retrieved' })
  findByUser(
    @CurrentUser('userId') userId: string,
    @Query('type') type?: string,
  ) {
    return this.filesService.findByUser(userId, type);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.filesService.remove(id, userId);
  }
}
