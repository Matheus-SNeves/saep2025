USE saep_db;

-- População (3 registros obrigatórios)
INSERT INTO Usuario (nome, email, senha) VALUES 
('Administrador', 'admin@saep.com', '1234'),
('João Silva', 'joao@saep.com', '1234'),
('Maria Oliveira', 'maria@saep.com', '1234');

INSERT INTO Produto (nome, descricao, preco, qtd_estoque, qtd_minima) VALUES 
('Cimento CP II', 'Saco 50kg', 35.00, 100, 20),
('Tinta Acrílica', 'Lata 18L Branca', 250.00, 12, 5),
('Tijolo Baiano', 'Milheiro', 600.00, 5000, 1000);

INSERT INTO Movimentacao (tipo, quantidade, usuarioId, produtoId) VALUES 
('ENTRADA', 100, 1, 1),
('SAIDA', 2, 2, 1),
('ENTRADA', 12, 1, 2);