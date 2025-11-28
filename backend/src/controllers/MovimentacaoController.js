const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async registrar(req, res) {
        const { produtoId, usuarioId, tipo, quantidade, data } = req.body;
        
        const qtdInt = parseInt(quantidade);
        const prodIdInt = parseInt(produtoId);
        const userIdInt = parseInt(usuarioId);

        try {
            const produto = await prisma.produto.findUnique({
                where: { id: prodIdInt }
            });

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            
            // 🚨 VALIDAÇÃO CRÍTICA DO BACKEND (RF008) 🚨
            // Se for SAÍDA e a quantidade a ser retirada for maior que o estoque atual (Minimo=0)
            if (tipo === 'SAIDA' && qtdInt > produto.qtd_estoque) {
                return res.status(400).json({ 
                    error: `Estoque insuficiente. Quantidade em estoque: ${produto.qtd_estoque}. Não é permitido estoque negativo.`
                });
            }

            // Cálculo do novo estoque
            let novoEstoque = produto.qtd_estoque;
            if (tipo === 'ENTRADA') {
                novoEstoque += qtdInt;
            } else if (tipo === 'SAIDA') {
                novoEstoque -= qtdInt;
            }

            // Transação: Atualiza Estoque + Cria Histórico
            // ... (Lógica de $transaction omitida)

            // Lógica de Alerta de Estoque Mínimo (RF007)
            const alerta = (tipo === 'SAIDA' && novoEstoque < produto.qtd_minima);

            return res.json({
                success: true,
                novoEstoque,
                alerta
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao processar movimentação' });
        }
    }
};