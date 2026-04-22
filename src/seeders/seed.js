require('dotenv').config();

const mongoose = require('mongoose');
const { EnterpriseModel } = require('../modules/enterprise/enterprise.schema');
const { ClientModel, ClientEnterpriseModel } = require('../modules/client/client.schema');
const { logger } = require('../utils/logger');

const enterprises = [
  {
    name: 'Marjane Supermarché',
    isActive: true,
    loyaltyConfig: { mode: 'linear', pointsPerMAD: 0.1 },
  },
  {
    name: 'Biougnach Electronics',
    isActive: true,
    loyaltyConfig: { mode: 'linear', pointsPerMAD: 0.2 },
  },
  {
    name: 'Café Tanger',
    isActive: true,
    loyaltyConfig: {
      mode: 'category',
      defaultPointsPerMAD: 0.1,
      rates: [
        { category: 'coffee',   pointsPerMAD: 0.3  },
        { category: 'food',     pointsPerMAD: 0.15 },
        { category: 'pastries', pointsPerMAD: 0.2  },
      ],
    },
  },
  {
    name: 'Label Vie',
    isActive: true,
    loyaltyConfig: {
      mode: 'range',
      tiers: [
        { minAmount: 0,    maxAmount: 100,  pointsPerMAD: 0.05 },
        { minAmount: 100,  maxAmount: 500,  pointsPerMAD: 0.1  },
        { minAmount: 500,  maxAmount: 1000, pointsPerMAD: 0.15 },
        { minAmount: 1000, maxAmount: null, pointsPerMAD: 0.25 },
      ],
    },
  },
  {
    name: 'Pharmacia Al Amal',
    isActive: false,
    loyaltyConfig: { mode: 'linear', pointsPerMAD: 0.1 },
  },
];

const clientsData = [
  { name: 'Youssef El Amrani',  phone: '0661234567', email: 'youssef@example.com' },
  { name: 'Fatima Zahra Idrissi', phone: '0662345678', email: 'fatima@example.com' },
  { name: 'Omar Bensouda',      phone: '0663456789', email: 'omar@example.com'    },
  { name: 'Nadia Chraibi',      phone: '0664567890', email: 'nadia@example.com'   },
  { name: 'Karim Tazi',         phone: '0665678901', email: 'karim@example.com'   },
];

const seed = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env');

  await mongoose.connect(uri);
  logger.info('Connected to MongoDB');

  await EnterpriseModel.deleteMany({});
  await ClientModel.deleteMany({});
  await ClientEnterpriseModel.deleteMany({});
  logger.info('Cleared existing data');

  const insertedEnterprises = await EnterpriseModel.insertMany(enterprises);
  logger.info(`Inserted ${insertedEnterprises.length} enterprises`);

  const insertedClients = await ClientModel.insertMany(clientsData);
  logger.info(`Inserted ${insertedClients.length} clients`);

  const loyaltyAccounts = insertedEnterprises.flatMap((enterprise) =>
    insertedClients.map((client, i) => ({
      clientId: client._id,
      enterpriseId: enterprise._id,
      pointsBalance: [0, 150, 320, 75, 500][i],
    }))
  );

  await ClientEnterpriseModel.insertMany(loyaltyAccounts);
  logger.info(`Inserted ${loyaltyAccounts.length} loyalty accounts`);

  console.log('--- ENTERPRISES ---');
  insertedEnterprises.forEach((e) => {
    console.log(`[${e.loyaltyConfig.mode.padEnd(8)}] ${e.name}`);
    console.log(`   enterpriseId: ${e._id}\n`);
  });

  console.log('--- CLIENTS ---');
  insertedClients.forEach((c) => {
    console.log(`${c.name}`);
    console.log(`   clientId: ${c._id}\n`);
  });


  await mongoose.disconnect();
  logger.info('Seeding complete');
};

seed().catch((err) => {
  logger.error('Seeder failed', { error: err.message });
  process.exit(1);
});