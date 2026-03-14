import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Product images from asset retrieval
const productImages = [
  'https://cdn.abacus.ai/images/e33e0528-a2e5-459e-8422-09ee03ce0cef.png',
  'https://cdn.abacus.ai/images/103a25e2-97b8-4756-9a9a-590f9b82f310.png',
  'https://cdn.abacus.ai/images/fdd3cfec-5631-4a0c-b9e6-62ab3927ae45.png',
  'https://cdn.abacus.ai/images/52dde5ac-8219-431e-886b-c604fbd686fa.png',
  'https://cdn.abacus.ai/images/fc31e86e-3ae7-4c73-b9e6-a838763fd0b5.png',
  'https://cdn.abacus.ai/images/1ba9cef9-8ec4-4e47-9aec-40b1cdf43132.png',
  'https://cdn.abacus.ai/images/e4af446e-5e58-4eef-85ea-c0ecf46049dc.png',
  'https://cdn.abacus.ai/images/9fc68d69-45c3-4bbb-a01d-dd69d24255cf.png',
  'https://cdn.abacus.ai/images/6731fadb-7c2a-4dc7-a5ca-dbc562b1c098.png',
  'https://cdn.abacus.ai/images/8d889355-0199-4d0d-9c8d-363bd6ad2cd9.png'
];

const products = [
  { code: 'TSH-001', name: 'Premium T-Shirt', color: 'White', size: 'L' },
  { code: 'SNK-002', name: 'Running Sneakers', color: 'White', size: '10' },
  { code: 'HPH-003', name: 'Wireless Headphones', color: 'Red', size: 'One Size' },
  { code: 'BTL-004', name: 'Water Bottle', color: 'Clear', size: '500ml' },
  { code: 'WCH-005', name: 'Luxury Watch', color: 'Silver', size: 'Adjustable' },
  { code: 'PHC-006', name: 'Phone Case', color: 'Multicolor', size: 'iPhone 13' },
  { code: 'BPK-007', name: 'Travel Backpack', color: 'Black', size: 'Large' },
  { code: 'SNG-008', name: 'Designer Sunglasses', color: 'Black/Gold', size: 'One Size' },
  { code: 'LPS-009', name: 'Laptop Sleeve', color: 'Gray', size: '15 inch' },
  { code: 'JKT-010', name: 'Leather Jacket', color: 'Brown', size: 'M' }
];

async function main() {
  console.log('Starting database seeding...');

  // Create Admin Accounts
  console.log('Creating admin accounts...');
  
  const admin1 = await prisma.user.upsert({
    where: { username: 'trongdat1793' },
    update: {},
    create: {
      username: 'trongdat1793',
      email: 'trongdat1793@admin.com',
      name: 'Trong Dat',
      password: await bcrypt.hash('D@t112358', 12),
      role: 'admin'
    }
  });
  console.log('Created admin:', admin1.email);

  const admin2 = await prisma.user.upsert({
    where: { username: 'tranquynh2610' },
    update: {},
    create: {
      username: 'tranquynh2610',
      email: 'tranquynh2610@admin.com',
      name: 'Tran Quynh',
      password: await bcrypt.hash('@uynh112358', 12),
      role: 'admin'
    }
  });
  console.log('Created admin:', admin2.username);

  // Create Default Test Account (Required for testing)
  const testAdmin = await prisma.user.upsert({
    where: { username: 'johndoe' },
    update: {},
    create: {
      username: 'johndoe',
      email: 'john@doe.com',
      name: 'John Doe',
      password: await bcrypt.hash('johndoe123', 12),
      role: 'admin'
    }
  });
  console.log('Created test admin:', testAdmin.username);

  // Create Sample User Accounts
  console.log('Creating sample user accounts...');
  
  const user1 = await prisma.user.upsert({
    where: { username: 'alicesmith' },
    update: {},
    create: {
      username: 'alicesmith',
      email: 'alice.smith@example.com',
      name: 'Alice Smith',
      password: await bcrypt.hash('password123', 12),
      role: 'user'
    }
  });
  console.log('Created user:', user1.username);

  const user2 = await prisma.user.upsert({
    where: { username: 'bobjohnson' },
    update: {},
    create: {
      username: 'bobjohnson',
      email: 'bob.johnson@example.com',
      name: 'Bob Johnson',
      password: await bcrypt.hash('password123', 12),
      role: 'user'
    }
  });
  console.log('Created user:', user2.email);

  // Create Orders for User 1 (Alice)
  console.log('Creating orders for', user1.name);
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  for (let i = 0; i < 5; i++) {
    const product = products[i];
    const qty = Math.floor(Math.random() * 3) + 1;
    const price = parseFloat((Math.random() * 80 + 20).toFixed(2));
    const purchasePrice = parseFloat((price * 0.6).toFixed(2));
    const profit = (price * qty) - (purchasePrice * qty);
    const orderNumber = `ORD-2024-${1000 + i}`;

    const existing = await prisma.order.findFirst({ where: { orderNumber, userId: user1.id } });
    if (!existing) {
      await prisma.order.create({
        data: { orderNumber, userId: user1.id, trackStatus: statuses[i] as any, itemCode: product.code, imageUrl: productImages[i], color: product.color, size: product.size, qty, price, purchasePrice, profit }
      });
      console.log(`Created order: ${orderNumber}`);
    }
  }

  // Create Orders for User 2 (Bob)
  console.log('Creating orders for', user2.name);
  
  for (let i = 0; i < 5; i++) {
    const product = products[i + 5];
    const qty = Math.floor(Math.random() * 3) + 1;
    const price = parseFloat((Math.random() * 80 + 20).toFixed(2));
    const purchasePrice = parseFloat((price * 0.6).toFixed(2));
    const profit = (price * qty) - (purchasePrice * qty);
    const orderNumber = `ORD-2024-${2000 + i}`;

    const existing = await prisma.order.findFirst({ where: { orderNumber, userId: user2.id } });
    if (!existing) {
      await prisma.order.create({
        data: { orderNumber, userId: user2.id, trackStatus: statuses[i] as any, itemCode: product.code, imageUrl: productImages[i + 5], color: product.color, size: product.size, qty, price, purchasePrice, profit }
      });
      console.log(`Created order: ${orderNumber}`);
    }
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
