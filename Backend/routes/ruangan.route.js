const ruanganController = require('../controllers/ruangan.controller');
const express = require('express');
const router = express.Router();

router.post('/create', ruanganController.createRuangan);
router.get('/', ruanganController.getAllRuangan);
router.get('/:id', ruanganController.getRuanganById);
router.put('/:id', ruanganController.updateRuangan);
router.delete('/:id', ruanganController.deleteRuangan);

module.exports = router; 