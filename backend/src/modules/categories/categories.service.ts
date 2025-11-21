import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all categories with their skills
   */
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        skills: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            skills: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  /**
   * Get single category by ID
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        skills: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            skills: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Get category by slug
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        skills: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Get skills for a category
   */
  async getSkills(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const skills = await this.prisma.skill.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return skills;
  }

  /**
   * Create new category (admin only)
   */
  async create(dto: CreateCategoryDto) {
    const slug = this.generateSlug(dto.name);

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon,
      },
      include: {
        skills: true,
      },
    });

    return category;
  }

  /**
   * Update category (admin only)
   */
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.slug = this.generateSlug(dto.name);
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        skills: true,
      },
    });

    return updated;
  }

  /**
   * Deactivate category (admin only)
   */
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Category deactivated successfully' };
  }

  /**
   * Add skill to category (admin only)
   */
  async addSkill(categoryId: string, dto: CreateSkillDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    const skill = await this.prisma.skill.create({
      data: {
        slug,
        name: dto.name,
        description: dto.description,
        categoryId,
      } as any,
    });

    return skill;
  }

  /**
   * Update skill (admin only)
   */
  async updateSkill(skillId: string, dto: CreateSkillDto) {
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const updated = await this.prisma.skill.update({
      where: { id: skillId },
      data: dto,
    });

    return updated;
  }

  /**
   * Remove skill (admin only)
   */
  async removeSkill(skillId: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    await this.prisma.skill.update({
      where: { id: skillId },
      data: { isActive: false },
    });

    return { message: 'Skill deactivated successfully' };
  }

  /**
   * Get all cities
   */
  async findAllCities() {
    const cities = await this.prisma.city.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        department: true,
        latitude: true,
        longitude: true,
      },
    });

    return cities;
  }

  /**
   * Generate URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
