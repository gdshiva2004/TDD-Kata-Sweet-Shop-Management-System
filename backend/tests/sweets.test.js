const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();
const app = require('../backend/src/app');
const User = require('../backend/src/models/User');
const Sweet = require('../backend/src/models/Sweet');
const jwt = require('jsonwebtoken');

let tokenUser, tokenAdmin;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  await Sweet.deleteMany({});
  const admin = new User({ name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin' });
  const user = new User({ name: 'User', email: 'user@example.com', password: 'password', role: 'user' });
  await admin.save();
  await user.save();
  tokenAdmin = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET);
  tokenUser = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Sweets API', () => {
  test('Admin can create a sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'Gulab Jamun', category: 'Indian', price: 50, quantity: 10 });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Gulab Jamun');
  });

  test('User cannot create a sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ name: 'Rasgulla', category: 'Indian', price: 40, quantity: 5 });
    expect(res.statusCode).toBe(403);
  });

  test('Anyone can list sweets', async () => {
    const res = await request(app).get('/api/sweets');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Purchase decreases quantity', async () => {
    const sweet = await Sweet.findOne({ name: 'Gulab Jamun' });
    const res = await request(app)
      .post(`/api/sweets/${sweet._id}/purchase`)
      .set('Authorization', `Bearer ${tokenUser}`)
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.sweet.quantity).toBe(sweet.quantity - 1);
  });
});
