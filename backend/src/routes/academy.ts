import prisma from '../lib/prisma';
import express from 'express';


import { authenticateToken } from '../middleware/auth';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const courses = await prisma.academyCourse.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { title, instructor, level, duration, description, price, countryCode, language, category, students, rating, image } = req.body;
    const course = await prisma.academyCourse.create({
      data: {
        title,
        instructor,
        level: level || 'Beginner',
        duration: duration || '1 Hour',
        description,
        price: parseFloat(price || '0'),
        countryCode: countryCode || 'US',
        language: language || 'English',
        category: category || 'Development',
        students: parseInt(students || '0', 10),
        rating: parseFloat(rating || '5.0'),
        image: image || '/avatars/avatar_1.png'
      }
    });
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

export default router;
