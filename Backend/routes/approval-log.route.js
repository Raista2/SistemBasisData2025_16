const express = require('express');
const router = express.Router();
const approvalLogController = require('../controllers/approval-log.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

router.get('/', authenticate, authorizeAdmin, approvalLogController.getAllApprovalLogs);
router.get('/peminjaman/:peminjamanId', authenticate, approvalLogController.getApprovalLogsByPeminjaman);

module.exports = router;