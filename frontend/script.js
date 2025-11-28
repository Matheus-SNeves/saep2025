const API_URL = 'http://localhost:3000';

let listaProdutos = []; 
let produtosEmEstoque = []; 

async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('msg-erro'); 

    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    const data = await res.json();
    if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.href = 'dashboard.html';
    } else {
        msgErro.style.display = 'block';
        msgErro.innerText = data.message || 'Credenciais Inválidas! Tentando novamente...';
        setTimeout(() => window.location.reload(), 2500);
    }
}

function verificarAuth() {
    const user = JSON.parse(localStorage.getItem('usuario'));
    if (!user) window.location.href = 'index.html';
    if (document.getElementById('user-name')) {
        document.getElementById('user-name').innerText = user.nome;
    }
}

function logout() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

async function carregarProdutos() {
    const res = await fetch(`${API_URL}/produtos`);
    listaProdutos = await res.json();
    renderizarTabela(listaProdutos);
}

function renderizarTabela(produtos) {
    const tbody = document.getElementById('tabela-produtos');
    if (!tbody) return;
    tbody.innerHTML = '';
    produtos.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                <td>${p.qtd_estoque} (Min: ${p.qtd_minima})</td>
                <td>
                    <button onclick="editarProduto(${p.id})">Editar</button>
                    <button onclick="excluirProduto(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function buscarProduto() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = listaProdutos.filter(p => p.nome.toLowerCase().includes(termo));
    renderizarTabela(filtrados);
}

async function salvarProduto() {
    const id = document.getElementById('prod-id').value;
    const prod = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        preco: document.getElementById('preco').value,
        qtd_estoque: document.getElementById('estoque').value,
        qtd_minima: document.getElementById('minimo').value
    };

    if (!prod.nome || !prod.preco) return alert('Validação: Nome e Preço são campos obrigatórios.');

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod)
    });

    limparForm();
    carregarProdutos();
}

function editarProduto(id) {
    const p = listaProdutos.find(x => x.id === id);
    document.getElementById('prod-id').value = p.id;
    document.getElementById('nome').value = p.nome;
    document.getElementById('descricao').value = p.descricao || '';
    document.getElementById('preco').value = parseFloat(p.preco);
    document.getElementById('estoque').value = p.qtd_estoque;
    document.getElementById('minimo').value = p.qtd_minima;
}

async function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
        carregarProdutos();
    }
}

function limparForm() {
    document.getElementById('prod-id').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('estoque').value = '';
    document.getElementById('minimo').value = '';
}

async function carregarSelectProdutos() {
    const res = await fetch(`${API_URL}/produtos`);
    let produtos = await res.json();
    
    produtosEmEstoque = produtos; 

    for (let i = 0; i < produtos.length; i++) {
        for (let j = 0; j < (produtos.length - i - 1); j++) {
            if (produtos[j].nome.toLowerCase() > produtos[j + 1].nome.toLowerCase()) {
                let temp = produtos[j];
                produtos[j] = produtos[j + 1];
                produtos[j + 1] = temp;
            }
        }
    }

    const select = document.getElementById('select-produto');
    select.innerHTML = '<option value="">Selecione um Produto...</option>'; 
    produtos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.text = `${p.nome} (Atual: ${p.qtd_estoque})`;
        select.appendChild(option);
    });
    
    document.getElementById('data-mov').valueAsDate = new Date();
}

async function registrarMovimentacao() {
    const produtoId = document.getElementById('select-produto').value;
    const tipo = document.getElementById('tipo-mov').value;
    const quantidade = document.getElementById('qtd-mov').value;
    const data = document.getElementById('data-mov').value;
    const user = JSON.parse(localStorage.getItem('usuario'));

    if (!produtoId || !quantidade || !data || parseInt(quantidade) <= 0) {
        return alert('Preencha todos os dados e garanta que a quantidade é positiva.');
    }
    
    const qtdInt = parseInt(quantidade);
    const produtoSelecionado = produtosEmEstoque.find(p => p.id == produtoId);
    
    if (tipo === 'SAIDA' && produtoSelecionado) {
        if (qtdInt > produtoSelecionado.qtd_estoque) {
            alert(`BLOQUEADO: Estoque insuficiente. A quantidade (${qtdInt}) excede o estoque atual (${produtoSelecionado.qtd_estoque}). Não é permitido estoque negativo.`);
            return;
        }
    }

    const res = await fetch(`${API_URL}/movimentacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            produtoId,
            usuarioId: user.id,
            tipo,
            quantidade,
            data
        })
    });

    const responseData = await res.json();
    
    if (res.ok) {
        alert('Movimentação registrada com sucesso!');
        
        if (responseData.alerta) {
            alert('🚨 ATENÇÃO: O estoque deste produto ficou abaixo do mínimo configurado!');
        }
        window.location.reload(); 
    } else {
         alert(`Falha na Operação: ${responseData.error || 'Erro desconhecido.'}`);
    }
}