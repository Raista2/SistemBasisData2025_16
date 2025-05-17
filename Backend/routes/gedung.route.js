const express = require('express');
const router = express.Router();
const gedungController = require('../controllers/gedung.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

router.get('/', gedungController.getAllGedung);
router.get('/:id', gedungController.getGedungById);
router.post('/', authenticate, authorizeAdmin, gedungController.createGedung);
router.put('/:id', authenticate, authorizeAdmin, gedungController.updateGedung);
router.delete('/:id', authenticate, authorizeAdmin, gedungController.deleteGedung);

module.exports = router;