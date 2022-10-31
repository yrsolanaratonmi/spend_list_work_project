const express = require('express')
const router = express.Router()

const {
  getAllSpends,
  createSpend,
  updateSpend,
  deleteSpend
} = require('../controllers/spend.controller')

router.get('/allSpends', getAllSpends)
router.post('/spend', createSpend)
router.patch('/spend', updateSpend)
router.delete('/spend', deleteSpend)

module.exports = router