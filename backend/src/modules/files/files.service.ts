import { 
  Injectable, 
  BadRequestException,
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly uploadPath = './uploads';
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly allowedDocumentTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];
  private readonly allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];

  constructor(private prisma: PrismaService) {
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    type: 'image' | 'document' | 'video' = 'image',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    this.validateFileType(file, type);

    const fileUrl = `/uploads/${file.filename}`;
    const fileSize = file.size;

    // Save file metadata to database
    const fileRecord = await this.prisma.file.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: fileSize,
        path: file.path,
        url: fileUrl,
        uploadedById: userId,
      },
    });

    return {
      id: fileRecord.id,
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: fileSize,
      mimeType: file.mimetype,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    userId: string,
    type: 'image' | 'document' | 'video' = 'image',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles = [];

    for (const file of files) {
      try {
        const uploaded = await this.uploadFile(file, userId, type);
        uploadedFiles.push(uploaded);
      } catch (error) {
        // If one file fails, continue with others
        console.error(`Failed to upload ${file.originalname}:`, error);
      }
    }

    return uploadedFiles;
  }

  /**
   * Get file by ID
   */
  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Get files by user
   */
  async findByUser(userId: string, type?: string) {
    const where: any = { uploadedById: userId };
    if (type) {
      where.mimeType = { startsWith: type };
    }

    const files = await this.prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return files;
  }

  /**
   * Delete file
   */
  async remove(id: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if user owns the file
    if (file.uploadedById !== userId) {
      throw new BadRequestException('You do not have permission to delete this file');
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Failed to delete physical file:', error);
    }

    // Delete database record
    await this.prisma.file.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }

  /**
   * Validate file type
   */
  private validateFileType(
    file: Express.Multer.File,
    type: 'image' | 'document' | 'video',
  ) {
    let allowedTypes: string[];

    switch (type) {
      case 'image':
        allowedTypes = this.allowedImageTypes;
        break;
      case 'document':
        allowedTypes = this.allowedDocumentTypes;
        break;
      case 'video':
        allowedTypes = this.allowedVideoTypes;
        break;
      default:
        throw new BadRequestException('Invalid file type specified');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(filename: string): string {
    return `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/${filename}`;
  }

  /**
   * Clean up old files (can be called by cron job)
   */
  async cleanupOldFiles(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldFiles = await this.prisma.file.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    for (const file of oldFiles) {
      try {
        await fs.unlink(file.path);
        await this.prisma.file.delete({ where: { id: file.id } });
      } catch (error) {
        console.error(`Failed to cleanup file ${file.id}:`, error);
      }
    }

    return {
      message: `Cleaned up ${oldFiles.length} old files`,
      count: oldFiles.length,
    };
  }
}
