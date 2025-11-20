import { PrismaClient, UserRole, VerificationLevel, VerificationStatus, JobStatus, ProposalStatus, ContractStatus, MilestoneStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ================================================================
  // Clear existing data
  // ================================================================
  console.log('🗑️  Clearing existing data...');
  
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationUser.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.document.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.job.deleteMany();
  await prisma.review.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.proServiceArea.deleteMany();
  await prisma.proSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.category.deleteMany();
  await prisma.city.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.pro.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Existing data cleared\n');

  // ================================================================
  // Create Admin User
  // ================================================================
  console.log('👤 Creating admin user...');
  
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@soluciona.co',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Soluciona',
      role: UserRole.ADMIN,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
  });

  console.log(`✅ Admin created: ${admin.email}\n`);

  // ================================================================
  // Create Categories and Skills
  // ================================================================
  console.log('📂 Creating categories and skills...');
  
  const categories = [
    {
      slug: 'pintura',
      name: 'Pintura y Acabados',
      description: 'Pintura interior y exterior, acabados decorativos',
      icon: '🎨',
      order: 1,
      priceMin: 50000,
      priceMax: 500000,
      priceUnit: 'por m²',
      skills: ['Pintura interior', 'Pintura exterior', 'Estuco', 'Texturizado', 'Laqueado']
    },
    {
      slug: 'drywall',
      name: 'Drywall y Carpintería',
      description: 'Instalación de drywall, muebles, puertas',
      icon: '🔨',
      order: 2,
      priceMin: 80000,
      priceMax: 800000,
      priceUnit: 'por m²',
      skills: ['Instalación drywall', 'Cielo raso', 'Muebles a medida', 'Puertas', 'Closets']
    },
    {
      slug: 'obra-liviana',
      name: 'Obra Liviana',
      description: 'Remodelaciones menores, mampostería',
      icon: '🏗️',
      order: 3,
      priceMin: 100000,
      priceMax: 1000000,
      priceUnit: 'por proyecto',
      skills: ['Mampostería', 'Resanes', 'Revoques', 'Divisiones', 'Ampliaciones']
    },
    {
      slug: 'pisos',
      name: 'Pisos y Enchapes',
      description: 'Instalación de pisos, baldosas, enchapes',
      icon: '⬛',
      order: 4,
      priceMin: 70000,
      priceMax: 600000,
      priceUnit: 'por m²',
      skills: ['Cerámica', 'Porcelanato', 'Laminado', 'Vinilo', 'Enchapes']
    },
    {
      slug: 'electricidad',
      name: 'Electricidad',
      description: 'Instalaciones eléctricas, reparaciones',
      icon: '⚡',
      order: 5,
      priceMin: 60000,
      priceMax: 700000,
      priceUnit: 'por punto',
      skills: ['Instalación luminarias', 'Tomacorrientes', 'Tableros', 'Cableado', 'Reparaciones']
    },
    {
      slug: 'plomeria',
      name: 'Plomería',
      description: 'Instalaciones sanitarias, reparaciones',
      icon: '🚰',
      order: 6,
      priceMin: 50000,
      priceMax: 600000,
      priceUnit: 'por servicio',
      skills: ['Instalación sanitarios', 'Grifería', 'Desagües', 'Tuberías', 'Reparaciones']
    },
  ];

  for (const cat of categories) {
    const { skills, ...catData } = cat;
    console.log(`Creating category: ${catData.name} with slug: ${catData.slug}`);
    
    try {
      const category = await prisma.category.create({
        data: {
          ...catData,
          isActive: true,
          skills: {
            create: skills.map((skillName, index) => {
              const baseSlug = skillName
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              // Add category slug prefix to make skill slugs unique
              const uniqueSlug = `${catData.slug}-${baseSlug}`;
              return {
                slug: uniqueSlug,
                name: skillName,
              };
            }),
          },
        },
        include: { skills: true },
      });
      console.log(`✅ Category created: ${category.name} (${category.skills.length} skills)`);
    } catch (error) {
      console.error(`❌ Error creating category ${catData.name}:`, error.message);
      // Check if category already exists
      const existing = await prisma.category.findUnique({ where: { slug: catData.slug } });
      console.log(`Existing category with slug ${catData.slug}:`, existing);
      throw error;
    }
  }

  console.log('');

  // ================================================================
  // Create Cities
  // ================================================================
  console.log('🏙️  Creating cities...');
  
  const citiesData = [
    { name: 'Bogotá', department: 'Cundinamarca', latitude: 4.7110, longitude: -74.0721 },
    { name: 'Medellín', department: 'Antioquia', latitude: 6.2442, longitude: -75.5812 },
    { name: 'Cali', department: 'Valle del Cauca', latitude: 3.4516, longitude: -76.5320 },
    { name: 'Barranquilla', department: 'Atlántico', latitude: 10.9685, longitude: -74.7813 },
    { name: 'Cartagena', department: 'Bolívar', latitude: 10.3910, longitude: -75.4794 },
    { name: 'Cúcuta', department: 'Norte de Santander', latitude: 7.8939, longitude: -72.5078 },
    { name: 'Bucaramanga', department: 'Santander', latitude: 7.1193, longitude: -73.1227 },
    { name: 'Pereira', department: 'Risaralda', latitude: 4.8133, longitude: -75.6961 },
    { name: 'Santa Marta', department: 'Magdalena', latitude: 11.2408, longitude: -74.2075 },
    { name: 'Manizales', department: 'Caldas', latitude: 5.0689, longitude: -75.5174 },
    { name: 'Ibagué', department: 'Tolima', latitude: 4.4389, longitude: -75.2322 },
    { name: 'Pasto', department: 'Nariño', latitude: 1.2136, longitude: -77.2811 },
  ];

  for (const cityData of citiesData) {
    const city = await prisma.city.create({ data: cityData });
    console.log(`✅ City created: ${city.name}`);
  }

  console.log('');

  // ================================================================
  // Create Client Users
  // ================================================================
  console.log('👥 Creating client users...');
  
  const clientNames = [
    { firstName: 'María', lastName: 'González' },
    { firstName: 'Juan', lastName: 'Rodríguez' },
    { firstName: 'Ana', lastName: 'Martínez' },
    { firstName: 'Carlos', lastName: 'López' },
    { firstName: 'Laura', lastName: 'García' },
    { firstName: 'Diego', lastName: 'Hernández' },
    { firstName: 'Valentina', lastName: 'Díaz' },
    { firstName: 'Andrés', lastName: 'Torres' },
    { firstName: 'Camila', lastName: 'Ramírez' },
    { firstName: 'Santiago', lastName: 'Flores' },
    { firstName: 'Isabella', lastName: 'Castro' },
    { firstName: 'Miguel', lastName: 'Vargas' },
    { firstName: 'Sofía', lastName: 'Ruiz' },
    { firstName: 'Daniel', lastName: 'Morales' },
    { firstName: 'Mariana', lastName: 'Jiménez' },
    { firstName: 'Felipe', lastName: 'Muñoz' },
    { firstName: 'Daniela', lastName: 'Álvarez' },
    { firstName: 'Sebastián', lastName: 'Romero' },
    { firstName: 'Natalia', lastName: 'Medina' },
    { firstName: 'Alejandro', lastName: 'Gutiérrez' },
    { firstName: 'Paula', lastName: 'Silva' },
    { firstName: 'Nicolás', lastName: 'Ortiz' },
    { firstName: 'Carolina', lastName: 'Reyes' },
    { firstName: 'David', lastName: 'Peña' },
    { firstName: 'Gabriela', lastName: 'Molina' },
    { firstName: 'Mateo', lastName: 'Vega' },
    { firstName: 'Juliana', lastName: 'Herrera' },
    { firstName: 'Lucas', lastName: 'Ríos' },
    { firstName: 'Valeria', lastName: 'Mendoza' },
    { firstName: 'Tomás', lastName: 'Aguilar' },
  ];

  const defaultPassword = await bcrypt.hash('Demo123!', 10);
  const clients = [];

  for (let i = 0; i < clientNames.length; i++) {
    const client = await prisma.user.create({
      data: {
        email: `${clientNames[i].firstName.toLowerCase()}.${clientNames[i].lastName.toLowerCase()}@gmail.com`,
        password: defaultPassword,
        firstName: clientNames[i].firstName,
        lastName: clientNames[i].lastName,
        role: UserRole.CLIENT,
        phone: `+57 ${300 + i} ${Math.floor(Math.random() * 9000000) + 1000000}`,
        isPhoneVerified: Math.random() > 0.3,
        isEmailVerified: true,
        isActive: true,
      },
    });
    clients.push(client);
    if ((i + 1) % 10 === 0) {
      console.log(`✅ Created ${i + 1}/${clientNames.length} clients`);
    }
  }

  console.log(`✅ All ${clients.length} clients created\n`);

  // ================================================================
  // Create Pro Users with Verification
  // ================================================================
  console.log('🔨 Creating professional users...');
  
  const proNames = [
    { firstName: 'Carlos', lastName: 'Pintor', specialty: 'pintura', level: VerificationLevel.GOLD },
    { firstName: 'Roberto', lastName: 'Acabados', specialty: 'pintura', level: VerificationLevel.SILVER },
    { firstName: 'Luis', lastName: 'Carpintero', specialty: 'drywall', level: VerificationLevel.GOLD },
    { firstName: 'Jorge', lastName: 'Construcción', specialty: 'obra-liviana', level: VerificationLevel.GOLD },
    { firstName: 'Pedro', lastName: 'Albañil', specialty: 'obra-liviana', level: VerificationLevel.SILVER },
    { firstName: 'Mario', lastName: 'Pisos', specialty: 'pisos', level: VerificationLevel.GOLD },
    { firstName: 'Fernando', lastName: 'Enchapes', specialty: 'pisos', level: VerificationLevel.SILVER },
    { firstName: 'Ricardo', lastName: 'Electricista', specialty: 'electricidad', level: VerificationLevel.GOLD },
    { firstName: 'Javier', lastName: 'Instalaciones', specialty: 'electricidad', level: VerificationLevel.SILVER },
    { firstName: 'Alberto', lastName: 'Plomero', specialty: 'plomeria', level: VerificationLevel.SILVER },
    { firstName: 'Héctor', lastName: 'Sanitarios', specialty: 'plomeria', level: VerificationLevel.BRONZE },
    { firstName: 'Raúl', lastName: 'Reformas', specialty: 'drywall', level: VerificationLevel.SILVER },
    { firstName: 'Oscar', lastName: 'Maestro', specialty: 'pintura', level: VerificationLevel.BRONZE },
    { firstName: 'Mauricio', lastName: 'Obra', specialty: 'obra-liviana', level: VerificationLevel.BRONZE },
    { firstName: 'Gustavo', lastName: 'Remodelador', specialty: 'drywall', level: VerificationLevel.BRONZE },
    { firstName: 'Julio', lastName: 'Instalador', specialty: 'pisos', level: VerificationLevel.BRONZE },
    { firstName: 'Iván', lastName: 'Técnico', specialty: 'electricidad', level: VerificationLevel.BRONZE },
    { firstName: 'Ernesto', lastName: 'Fontanero', specialty: 'plomeria', level: VerificationLevel.BRONZE },
    { firstName: 'Francisco', lastName: 'Decorador', specialty: 'pintura', level: VerificationLevel.SILVER },
    { firstName: 'Leonardo', lastName: 'Constructor', specialty: 'obra-liviana', level: VerificationLevel.SILVER },
  ];

  const allCategories = await prisma.category.findMany({ include: { skills: true } });
  const allCities = await prisma.city.findMany();
  const pros = [];

  for (let i = 0; i < proNames.length; i++) {
    const proData = proNames[i];
    const category = allCategories.find(c => c.slug === proData.specialty);
    
    const user = await prisma.user.create({
      data: {
        email: `${proData.firstName.toLowerCase()}.${proData.lastName.toLowerCase()}@gmail.com`,
        password: defaultPassword,
        firstName: proData.firstName,
        lastName: proData.lastName,
        role: UserRole.PRO,
        phone: `+57 ${310 + i} ${Math.floor(Math.random() * 9000000) + 1000000}`,
        isPhoneVerified: true,
        isEmailVerified: true,
        isActive: true,
      },
    });

    const rating = 3.5 + Math.random() * 1.5; // 3.5 - 5.0
    const totalReviews = Math.floor(Math.random() * 50) + (proData.level === VerificationLevel.GOLD ? 20 : 5);
    const completedJobs = Math.floor(totalReviews * 1.2);

    const pro = await prisma.pro.create({
      data: {
        userId: user.id,
        bio: `Especialista en ${category?.name} con más de ${5 + i} años de experiencia. Trabajo profesional y garantizado.`,
        yearsExperience: 5 + i,
        teamSize: Math.floor(Math.random() * 3) + 1,
        verificationLevel: proData.level,
        isAvailable: Math.random() > 0.2,
        responseTimeHours: Math.floor(Math.random() * 48) + 1,
        serviceRadiusKm: 20 + Math.floor(Math.random() * 30),
        averageRating: parseFloat(rating.toFixed(2)),
        totalReviews,
        completedJobs,
        totalJobs: completedJobs + Math.floor(Math.random() * 5),
        skills: {
          create: category?.skills.slice(0, 2 + Math.floor(Math.random() * 3)).map(skill => ({
            skillId: skill.id,
          })) || [],
        },
        serviceAreas: {
          create: allCities.slice(0, 2 + Math.floor(Math.random() * 3)).map(city => ({
            cityId: city.id,
          })),
        },
        verifications: {
          create: {
            status: VerificationStatus.APPROVED,
            level: proData.level,
            fullName: `${user.firstName} ${user.lastName}`,
            identityNumber: `${10000000 + i * 111111}`,
            identityType: 'CC',
            hasIdFront: true,
            hasIdBack: true,
            hasSelfie: true,
            hasRut: proData.level !== VerificationLevel.BRONZE,
            hasPoliceCert: proData.level === VerificationLevel.GOLD || proData.level === VerificationLevel.SILVER,
            hasProcuraduria: proData.level === VerificationLevel.GOLD,
            hasContraloria: proData.level === VerificationLevel.GOLD,
            idVerified: true,
            livenessVerified: true,
            backgroundVerified: proData.level === VerificationLevel.GOLD || proData.level === VerificationLevel.SILVER,
            reviewedBy: admin.id,
            reviewedAt: new Date(),
          },
        },
      },
    });

    pros.push({ user, pro, category });
    
    if ((i + 1) % 5 === 0) {
      console.log(`✅ Created ${i + 1}/${proNames.length} pros`);
    }
  }

  console.log(`✅ All ${pros.length} pros created\n`);

  console.log('✅ Database seeding completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Admin users: 1`);
  console.log(`👥 Client users: ${clients.length}`);
  console.log(`🔨 Pro users: ${pros.length}`);
  console.log(`📂 Categories: ${allCategories.length}`);
  console.log(`🏙️  Cities: ${allCities.length}`);
  console.log('');
  console.log('🔐 Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@soluciona.co');
  console.log('  Password: Admin123!');
  console.log('');
  console.log('Client:');
  console.log('  Email: maria.gonzález@gmail.com');
  console.log('  Password: Demo123!');
  console.log('');
  console.log('Pro (Gold):');
  console.log('  Email: carlos.pintor@gmail.com');
  console.log('  Password: Demo123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
