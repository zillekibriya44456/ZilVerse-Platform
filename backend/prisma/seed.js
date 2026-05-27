const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@zilverse.com' } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('Admin@12345', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@zilverse.com',
        password: hashed,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created');
    console.log('   Email   : admin@zilverse.com');
    console.log('   Password: Admin@12345');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Seed demo projects if none exist
  const count = await prisma.project.count();
  if (count === 0) {
    const seller = await prisma.user.findUnique({ where: { email: 'admin@zilverse.com' } });
    if (seller) {
      await prisma.project.createMany({
        data: [
          { title: 'Full E-Commerce Platform', description: 'Complete online store with cart, payment gateway & admin panel.', price: 4999, sellerId: seller.id },
          { title: 'Hospital Management System', description: 'Patient records, appointments, billing, and reports.', price: 1499, sellerId: seller.id },
          { title: 'SaaS Starter Boilerplate', description: 'Production-ready SaaS with auth, billing and dashboard.', price: 7999, sellerId: seller.id },
          { title: 'Online Food Ordering App', description: 'Food delivery app with real-time tracking and admin panel.', price: 1999, sellerId: seller.id },
          { title: 'Online Learning Platform', description: 'LMS with courses, video streaming, quizzes & certificates.', price: 9999, sellerId: seller.id },
          { title: 'Developer Portfolio Template', description: 'Animated dark mode portfolio with blog and contact form.', price: 999, sellerId: seller.id },
        ],
      });
      console.log('✅ Demo projects seeded');
    }
  } else {
    console.log(`ℹ️  ${count} project(s) already in database`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
