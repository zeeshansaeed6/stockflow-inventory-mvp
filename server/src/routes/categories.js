const express = require('express');
const { authRequired } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

const validateId = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateId);
router.use(authRequired);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
