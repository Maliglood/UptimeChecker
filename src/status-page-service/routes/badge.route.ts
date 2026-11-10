import { Router } from 'express';
import { badgeController } from '../controllers/badge.controller.js';

export const badgeRouter = Router();

badgeRouter.get('/:siteId', badgeController);