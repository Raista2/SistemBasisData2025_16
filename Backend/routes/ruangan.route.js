const express = require('express');
const router = express.Router();
const ruanganController = require('../controllers/ruangan.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

router.get('/', ruanganController.getAllRuangan);
router.get('/:id', ruanganController.getRuanganById);
router.get('/gedung/:gedungId', ruanganController.getRuanganByGedung);
router.post('/', authenticate, authorizeAdmin, ruanganController.createRuangan);
router.put('/:id', authenticate, authorizeAdmin, ruanganController.updateRuangan);
router.delete('/:id', authenticate, authorizeAdmin, ruanganController.deleteRuangan);

module.exports = router;