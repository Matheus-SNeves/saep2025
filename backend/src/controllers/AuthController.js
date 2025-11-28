const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async login(req, res) {
        const { email, senha } = req.body;

        try {
            const usuario = await prisma.usuario.findUnique({
                where: { email }
            });

            if (usuario && usuario.senha === senha) {
                return res.json({
                    success: true,
                    usuario: { id: usuario.id, nome: usuario.nome }
                });
            }

            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }
    }
};