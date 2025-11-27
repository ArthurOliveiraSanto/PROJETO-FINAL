let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
let editingVeiculoId = null;

const notification = document.getElementById('notification');

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleForm() {
    const form = document.getElementById('veiculo-form');
    const btn = document.getElementById('toggle-veiculo-btn');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.innerHTML = '<span>➖</span> Cancelar Cadastro';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span> Cadastrar Novo Veículo';
        cancelarEdicao();
    }
}

function cancelarEdicao() {
    editingVeiculoId = null;
    document.getElementById('formVeiculo').reset();
    document.getElementById('form-veiculo-title').textContent = '🎯 Cadastrar Novo Veículo';
    document.getElementById('veiculo-id').value = '';
    
    const btn = document.getElementById('toggle-veiculo-btn');
    btn.innerHTML = '<span>➕</span> Cadastrar Novo Veículo';
    document.getElementById('veiculo-form').style.display = 'none';
}

function editarVeiculo(id) {
    const veiculo = veiculos.find(v => v.id === id);
    if (!veiculo) return;

    editingVeiculoId = id;
    
    document.getElementById('veiculo-id').value = veiculo.id;
    document.getElementById('marca').value = veiculo.marca;
    document.getElementById('modelo').value = veiculo.modelo;
    document.getElementById('ano').value = veiculo.ano;
    document.getElementById('estado').value = veiculo.estado;
    document.getElementById('chassi').value = veiculo.chassi || '';
    document.getElementById('observacoes').value = veiculo.observacoes || '';

    document.getElementById('form-veiculo-title').textContent = '✏️ Editar Veículo';
    document.getElementById('veiculo-form').style.display = 'block';
    document.getElementById('toggle-veiculo-btn').innerHTML = '<span>➖</span> Cancelar Edição';

    document.getElementById('veiculo-form').scrollIntoView({ behavior: 'smooth' });
}

function excluirVeiculo(id) {
    if (confirm('Tem certeza que deseja excluir este veículo?\nEsta ação não pode ser desfeita.')) {
        veiculos = veiculos.filter(v => v.id !== id);
        localStorage.setItem('veiculos', JSON.stringify(veiculos));
        atualizarListaVeiculos();
        atualizarEstatisticas();
        showNotification('Veículo excluído com sucesso!', 'success');
    }
}

document.getElementById('formVeiculo').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const veiculoData = {
        id: editingVeiculoId || Date.now(),
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        ano: document.getElementById('ano').value,
        estado: document.getElementById('estado').value,
        chassi: document.getElementById('chassi').value,
        observacoes: document.getElementById('observacoes').value,
        dataCadastro: new Date().toISOString()
    };

    if (editingVeiculoId) {
        const index = veiculos.findIndex(v => v.id === editingVeiculoId);
        veiculos[index] = veiculoData;
        showNotification('Veículo atualizado com sucesso!', 'success');
    } else {
        veiculos.push(veiculoData);
        showNotification('Veículo cadastrado com sucesso!', 'success');
    }

    localStorage.setItem('veiculos', JSON.stringify(veiculos));
    this.reset();
    cancelarEdicao();
    atualizarListaVeiculos();
    atualizarEstatisticas();
});

function atualizarListaVeiculos() {
    const lista = document.getElementById('lista-veiculos');
    const emptyState = document.getElementById('empty-veiculos');
    
    if (veiculos.length === 0) {
        lista.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    lista.innerHTML = veiculos.map(veiculo => `
        <tr>
            <td><strong>${veiculo.marca}</strong></td>
            <td>${veiculo.modelo}</td>
            <td>${veiculo.ano}</td>
            <td><span class="status-badge status-active">${veiculo.estado}</span></td>
            <td>${veiculo.chassi || '-'}</td>
            <td class="actions">
                <button class="btn btn-warning btn-sm" onclick="editarVeiculo(${veiculo.id})">
                    <span>✏️</span> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirVeiculo(${veiculo.id})">
                    <span>🗑️</span> Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

function atualizarEstatisticas() {
    document.getElementById('total-veiculos').textContent = veiculos.length;
    document.getElementById('veiculos-ativos').textContent = veiculos.length;
}

document.addEventListener('DOMContentLoaded', function() {
    atualizarListaVeiculos();
    atualizarEstatisticas();
});