import 'reflect-metadata';
import { config } from 'dotenv';
config();

import mongoose from 'mongoose';
import { User, UserSchema } from './users/user.schema';
import * as bcrypt from 'bcryptjs';

async function run() {
  const mongoUri = process.env.MONGO_URI || '';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';

  if (!mongoUri) throw new Error('MONGO_URI is required');

  await mongoose.connect(mongoUri);
  const UserModel = mongoose.model(User.name, UserSchema);

  const existing = await UserModel.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin already exists:', adminEmail);
  } else {
    const hash = await bcrypt.hash(adminPassword, 10);
    await UserModel.create({ name: 'Admin', email: adminEmail, password: hash, role: 'admin' });
    console.log('Seeded admin:', adminEmail);
  }

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
