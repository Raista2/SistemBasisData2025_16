const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjaman.controller');
const { authenticate, authorizeAdmin, authorizeOwnerOrAdmin } = require('../middlewares/auth.middleware');

router.get('/', authenticate, authorizeAdmin, peminjamanController.getAllPeminjaman);
router.get('/status/:status', authenticate, authorizeAdmin, peminjamanController.getPeminjamanByStatus);
router.get('/user/:userId', authenticate, authorizeOwnerOrAdmin, peminjamanController.getPeminjamanByUser);
router.get('/ruangan/:ruanganId', peminjamanController.getPeminjamanByRuangan);
router.get('/:id', authenticate, peminjamanController.getPeminjamanById);
router.post('/', authenticate, peminjamanController.createPeminjaman);
router.put('/:id/status', authenticate, authorizeAdmin, peminjamanController.updatePeminjamanStatus);
router.delete('/:id', authenticate, peminjamanController.deletePeminjaman);

module.exports = router;