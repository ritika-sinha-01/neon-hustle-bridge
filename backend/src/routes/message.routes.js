import { Router } from 'express';

import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createConversationValidation,
  sendMessageValidation,
  conversationIdValidation,
  listPaginationValidation,
} from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/conversations', validate(listPaginationValidation), messageController.listConversations);
router.post('/conversations', validate(createConversationValidation), messageController.createConversation);
router.get(
  '/conversations/:conversationId',
  validate([...conversationIdValidation, ...listPaginationValidation]),
  messageController.getConversation,
);
router.post(
  '/conversations/:conversationId/messages',
  validate(sendMessageValidation),
  messageController.sendMessage,
);
router.patch(
  '/conversations/:conversationId/read',
  validate(conversationIdValidation),
  messageController.markRead,
);

export default router;
