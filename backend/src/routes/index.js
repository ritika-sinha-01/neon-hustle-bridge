import { Router } from 'express';

import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import clientRoutes from './client.routes.js';
import opportunityRoutes from './opportunity.routes.js';
import applicationRoutes from './application.routes.js';
import messageRoutes from './message.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'hustlebridge-api',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/clients', clientRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/applications', applicationRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

export default router;
