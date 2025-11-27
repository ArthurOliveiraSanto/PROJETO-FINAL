let fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
let editingFornecedorId = null;

const notification = document.getElementById('notification');

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleForm() {
    const form = document.getElementById('fornecedor-form');
    const btn = document.getElementById('toggle-fornecedor-btn');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.innerHTML = '<span>➖</span> Cancelar Cadastro';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span> Novo Fornecedor';
        cancelarEdicao();
    }
}

function cancelarEdicao() {
    editingFornecedorId = null;
    document.getElementById('formFornecedor').reset();
    document.getElementById('form-fornecedor-title').textContent = '🏭 Novo Fornecedor';
    document.getElementById('fornecedor-id').value = '';
    
    const btn = document.getElementById('toggle-fornecedor-btn');
    btn.innerHTML = '<span>➕</span> Novo Fornecedor';
    document.getElementById('fornecedor-form').style.display = 'none';
}

function editarFornecedor(id) {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) return;

    editingFornecedorId = id;
    
    document.getElementById('fornecedor-id').value = fornecedor.id;
    document.getElementById('nome-fornecedor').value = fornecedor.nome;
    document.getElementById('tipo-fornecedor').value = fornecedor.tipo;
    document.getElementById('telefone-fornecedor').value = fornecedor.telefone;
    document.getElementById('email-fornecedor').value = fornecedor.email || '';
    document.getElementById('endereco-fornecedor').value = fornecedor.endereco || '';
    document.getElementById('especialidade-fornecedor').value = fornecedor.especialidade || '';
    document.getElementById('contato-fornecedor').value = fornecedor.contato || '';

    document.getElementById('form-fornecedor-title').textContent = '✏️ Editar Fornecedor';
    document.getElementById('fornecedor-form').style.display = 'block';
    document.getElementById('toggle-fornecedor-btn').innerHTML = '<span>➖</span> Cancelar Edição';

    document.getElementById('fornecedor-form').scrollIntoView({ behavior: 'smooth' });
}

function excluirFornecedor(id) {
    if (confirm('Tem certeza que deseja excluir este fornecedor?\nEsta ação não pode ser desfeita.')) {
        fornecedores = fornecedores.filter(f => f.id !== id);
        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
        atualizarListaFornecedores();
        atualizarEstatisticas();
        showNotification('Fornecedor excluído com sucesso!', 'success');
    }
}

document.getElementById('formFornecedor').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fornecedorData = {
        id: editingFornecedorId || Date.now(),
        nome: document.getElementById('nome-fornecedor').value,
        tipo: document.getElementById('tipo-fornecedor').value,
        telefone: document.getElementById('telefone-fornecedor').value,
        email: document.getElementById('email-fornecedor').value,
        endereco: document.getElementById('endereco-fornecedor').value,
        especialidade: document.getElementById('especialidade-fornecedor').value,
        contato: document.getElementById('contato-fornecedor').value,
        dataCadastro: new Date().toISOString()
    };

    if (editingFornecedorId) {
        const index = fornecedores.findIndex(f => f.id === editingFornecedorId);
        fornecedores[index] = fornecedorData;
        showNotification('Fornecedor atualizado com sucesso!', 'success');
    } else {
        fornecedores.push(fornecedorData);
        showNotification('Fornecedor cadastrado com sucesso!', 'success');
    }

    localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
    this.reset();
    cancelarEdicao();
    atualizarListaFornecedores();
    atualizarEstatisticas();
});

function atualizarListaFornecedores() {
    const lista = document.getElementById('lista-fornecedores');
    const emptyState = document.getElementById('empty-fornecedores');
    
    if (fornecedores.length === 0) {
        lista.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    lista.innerHTML = fornecedores.map(fornecedor => {
        const tipoIcon = {
            'oficina': '🔧',
            'funilaria': '🔨',
            'pecas': '🔩',
            'eletrica': '⚡',
            'estofamento': '🛋️',
            'documentacao': '📄',
            'seguros': '🛡️',
            'transportes': '🚛',
            'outros': '🔧'
        }[fornecedor.tipo] || '🔧';

        return `
            <tr>
                <td><strong>${fornecedor.nome}</strong></td>
                <td><span class="status-badge status-${fornecedor.tipo}">${tipoIcon} ${fornecedor.tipo}</span></td>
                <td>${fornecedor.telefone}</td>
                <td>${fornecedor.email || '-'}</td>
                <td>${fornecedor.especialidade ? fornecedor.especialidade.substring(0, 30) + (fornecedor.especialidade.length > 30 ? '...' : '') : '-'}</td>
                <td class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editarFornecedor(${fornecedor.id})">
                        <span>✏️</span> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirFornecedor(${fornecedor.id})">
                        <span>🗑️</span> Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function atualizarEstatisticas() {
    document.getElementById('total-fornecedores').textContent = fornecedores.length;
    document.getElementById('fornecedores-ativos').textContent = fornecedores.length;
}

document.addEventListener('DOMContentLoaded', function() {
    atualizarListaFornecedores();
    atualizarEstatisticas();
});