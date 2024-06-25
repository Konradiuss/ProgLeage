const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    
    
    // Проверка наличия пользователя с таким же логином или email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,

    });


    // Сохранение пользователя в базе данных
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'secretkey');
    res.status(201).json({ token, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, region: user.region, specialization: user.specialization } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Поиск пользователя по email
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Генерация JWT токена
    const token = jwt.sign({ userId: user._id }, 'secretkey');
    res.json({ token, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, region: user.region, specialization: user.specialization } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;