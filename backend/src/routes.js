const express = require('express');
const router = express.Router();

const AuthController = require('./controllers/AuthController');
const ProdutoController = require('./controllers/ProdutoController');
const MovimentacaoController = require('./controllers/MovimentacaoController');

router.post('/login', AuthController.login);

router.get('/produtos', ProdutoController.listar);
router.post('/produtos', ProdutoController.criar);
router.put('/produtos/:id', ProdutoController.atualizar);
router.delete('/produtos/:id', ProdutoController.excluir);

router.post('/movimentacao', MovimentacaoController.registrar);

module.exports = router;