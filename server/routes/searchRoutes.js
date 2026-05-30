import express from 'express';
import { semanticSearch } from '../controllers/searchController.js';

const router = express.Router();

router.get('/semantic', semanticSearch);

export default router;
