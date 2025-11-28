const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async listar(req, res) {
        try {
            const produtos = await prisma.produto.findMany();
            return res.json(produtos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar produtos' });
        }
    },

    async criar(req, res) {
        const { nome, descricao, preco, qtd_estoque, qtd_minima } = req.body;
        try {
            const produto = await prisma.produto.create({
                data: {
                    nome,
                    descricao,
                    preco: parseFloat(preco),
                    qtd_estoque: parseInt(qtd_estoque),
                    qtd_minima: parseInt(qtd_minima)
                }
            });
            return res.json(produto);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar produto' });
        }
    },

    async atualizar(req, res) {
        const { id } = req.params;
        const dados = req.body;

        if (dados.preco) dados.preco = parseFloat(dados.preco);
        if (dados.qtd_estoque) dados.qtd_estoque = parseInt(dados.qtd_estoque);
        if (dados.qtd_minima) dados.qtd_minima = parseInt(dados.qtd_minima);

        try {
            const produto = await prisma.produto.update({
                where: { id: parseInt(id) },
                data: dados
            });
            return res.json(produto);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar produto' });
        }
    },

    async excluir(req, res) {
        const { id } = req.params;
        try {
            await prisma.produto.delete({
                where: { id: parseInt(id) }
            });
            return res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir produto. Verifique se há movimentações vinculadas.' });
        }
    }
};