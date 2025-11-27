let manutencoes = JSON.parse(localStorage.getItem('manutencoes')) || [];
let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
let editingManutencaoId = null;

function toggleForm() {
    const form = document.getElementById('manutencao-form');
    const btn = document.getElementById('toggle-manutencao-btn');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.innerHTML = '<span>➖</span> Cancelar';
        popularSelectVeiculos();
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span> Nova Manutenção';
        cancelarEdicao();
    }
}

function popularSelectVeiculos() {
    const select = document.getElementById('veiculo-manutencao');
    select.innerHTML = '<option value="">Selecione um veículo</option>';
    veiculos.forEach(veiculo => {
        select.innerHTML += `<option value="${veiculo.id}">${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})</option>`;
    });
}

function cancelarEdicao() {
    editingManutencaoId = null;
    document.getElementById('formManutencao').reset();
    document.getElementById('form-manutencao-title').textContent = '🛠️ Nova Manutenção';
    document.getElementById('manutencao-id').value = '';
    
    const btn = document.getElementById('toggle-manutencao-btn');
    btn.innerHTML = '<span>➕</span> Nova Manutenção';
    document.getElementById('manutencao-form').style.display = 'none';
}

function editarManutencao(id) {
    const manutencao = manutencoes.find(m => m.id === id);
    if (!manutencao) return;

    editingManutencaoId = id;
    
    document.getElementById('manutencao-id').value = manutencao.id;
    document.getElementById('veiculo-manutencao').value = manutencao.veiculoId;
    document.getElementById('tipo-manutencao').value = manutencao.tipo;
    document.getElementById('data-manutencao').value = manutencao.data;
    document.getElementById('custo-manutencao').value = manutencao.custo;
    document.getElementById('servico-manutencao').value = manutencao.servico;
    document.getElementById('pecas-manutencao').value = manutencao.pecas || '';
    document.getElementById('fornecedor-manutencao').value = manutencao.fornecedor || '';

    document.getElementById('form-manutencao-title').textContent = '✏️ Editar Manutenção';
    document.getElementById('manutencao-form').style.display = 'block';
    document.getElementById('toggle-manutencao-btn').innerHTML = '<span>➖</span> Cancelar Edição';
    document.getElementById('manutencao-form').scrollIntoView({ behavior: 'smooth' });
}

function excluirManutencao(id) {
    if (confirm('Tem certeza que deseja excluir esta manutenção?\nEsta ação não pode ser desfeita.')) {
        manutencoes = manutencoes.filter(m => m.id !== id);
        localStorage.setItem('manutencoes', JSON.stringify(manutencoes));
        atualizarListaManutencoes();
        atualizarEstatisticas();
        showNotification('Manutenção excluída com sucesso!', 'success');
    }
}

document.getElementById('formManutencao').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const manutencaoData = {
        id: editingManutencaoId || Date.now(),
        veiculoId: document.getElementById('veiculo-manutencao').value,
        tipo: document.getElementById('tipo-manutencao').value,
        data: document.getElementById('data-manutencao').value,
        custo: parseFloat(document.getElementById('custo-manutencao').value),
        servico: document.getElementById('servico-manutencao').value,
        pecas: document.getElementById('pecas-manutencao').value,
        fornecedor: document.getElementById('fornecedor-manutencao').value,
        dataRegistro: new Date().toISOString()
    };

    if (editingManutencaoId) {
        const index = manutencoes.findIndex(m => m.id === editingManutencaoId);
        manutencoes[index] = manutencaoData;
        showNotification('Manutenção atualizada com sucesso!', 'success');
    } else {
        manutencoes.push(manutencaoData);
        showNotification('Manutenção cadastrada com sucesso!', 'success');
    }

    localStorage.setItem('manutencoes', JSON.stringify(manutencoes));
    this.reset();
    cancelarEdicao();
    atualizarListaManutencoes();
    atualizarEstatisticas();
});

function atualizarListaManutencoes() {
    const lista = document.getElementById('lista-manutencoes');
    const emptyState = document.getElementById('empty-manutencoes');
    
    if (manutencoes.length === 0) {
        lista.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    lista.innerHTML = manutencoes.map(manutencao => {
        const veiculo = veiculos.find(v => v.id === parseInt(manutencao.veiculoId));
        const tipoIcon = {
            'preventiva': '🛡️',
            'corretiva': '🔧',
            'preditiva': '📊',
            'restauracao': '🎨',
            'eletrica': '⚡',
            'mecanica': '🔩',
            'funilaria': '🔨',
            'pintura': '🎯'
        }[manutencao.tipo] || '🔧';

        return `
            <tr>
                <td><strong>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</strong></td>
                <td>${new Date(manutencao.data).toLocaleDateString('pt-BR')}</td>
                <td><span class="status-badge status-${manutencao.tipo}">${tipoIcon} ${manutencao.tipo}</span></td>
                <td>${manutencao.servico.substring(0, 50)}${manutencao.servico.length > 50 ? '...' : ''}</td>
                <td>R$ ${manutencao.custo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editarManutencao(${manutencao.id})">
                        <span>✏️</span> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirManutencao(${manutencao.id})">
                        <span>🗑️</span> Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function atualizarEstatisticas() {
    document.getElementById('total-manutencoes').textContent = manutencoes.length;
    
    const custoTotal = manutencoes.reduce((total, m) => total + parseFloat(m.custo), 0);
    document.getElementById('custo-total').textContent = `R$ ${custoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('total-investido').textContent = `R$ ${custoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    const mediaPorVeiculo = veiculos.length > 0 ? custoTotal / veiculos.length : 0;
    document.getElementById('media-veiculo').textContent = `R$ ${mediaPorVeiculo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    if (manutencoes.length > 0) {
        const ultima = manutencoes.sort((a, b) => new Date(b.data) - new Date(a.data))[0];
        document.getElementById('ultima-manutencao').textContent = new Date(ultima.data).toLocaleDateString('pt-BR');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    atualizarListaManutencoes();
    atualizarEstatisticas();
});