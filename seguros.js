let seguros = JSON.parse(localStorage.getItem('seguros')) || [];
let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
let editingSeguroId = null;

function toggleForm() {
    const form = document.getElementById('seguro-form');
    const btn = document.getElementById('toggle-seguro-btn');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.innerHTML = '<span>➖</span> Cancelar';
        popularSelectVeiculos();
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span> Novo Seguro';
        cancelarEdicao();
    }
}

function popularSelectVeiculos() {
    const select = document.getElementById('veiculo-seguro');
    select.innerHTML = '<option value="">Selecione um veículo</option>';
    veiculos.forEach(veiculo => {
        select.innerHTML += `<option value="${veiculo.id}">${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})</option>`;
    });
}

function cancelarEdicao() {
    editingSeguroId = null;
    document.getElementById('formSeguro').reset();
    document.getElementById('form-seguro-title').textContent = '🛡️ Novo Seguro';
    document.getElementById('seguro-id').value = '';
    
    const btn = document.getElementById('toggle-seguro-btn');
    btn.innerHTML = '<span>➕</span> Novo Seguro';
    document.getElementById('seguro-form').style.display = 'none';
}

function editarSeguro(id) {
    const seguro = seguros.find(s => s.id === id);
    if (!seguro) return;

    editingSeguroId = id;
    
    document.getElementById('seguro-id').value = seguro.id;
    document.getElementById('veiculo-seguro').value = seguro.veiculoId;
    document.getElementById('seguradora').value = seguro.seguradora;
    document.getElementById('apolice').value = seguro.apolice;
    document.getElementById('valor-seguro').value = seguro.valor;
    document.getElementById('inicio-seguro').value = seguro.inicio;
    document.getElementById('vencimento-seguro').value = seguro.vencimento;
    document.getElementById('cobertura-seguro').value = seguro.cobertura || '';
    document.getElementById('observacoes-seguro').value = seguro.observacoes || '';

    document.getElementById('form-seguro-title').textContent = '✏️ Editar Seguro';
    document.getElementById('seguro-form').style.display = 'block';
    document.getElementById('toggle-seguro-btn').innerHTML = '<span>➖</span> Cancelar Edição';
    document.getElementById('seguro-form').scrollIntoView({ behavior: 'smooth' });
}

function excluirSeguro(id) {
    if (confirm('Tem certeza que deseja excluir este seguro?\nEsta ação não pode ser desfeita.')) {
        seguros = seguros.filter(s => s.id !== id);
        localStorage.setItem('seguros', JSON.stringify(seguros));
        atualizarListaSeguros();
        atualizarEstatisticas();
        showNotification('Seguro excluído com sucesso!', 'success');
    }
}

document.getElementById('formSeguro').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const seguroData = {
        id: editingSeguroId || Date.now(),
        veiculoId: document.getElementById('veiculo-seguro').value,
        seguradora: document.getElementById('seguradora').value,
        apolice: document.getElementById('apolice').value,
        valor: parseFloat(document.getElementById('valor-seguro').value),
        inicio: document.getElementById('inicio-seguro').value,
        vencimento: document.getElementById('vencimento-seguro').value,
        cobertura: document.getElementById('cobertura-seguro').value,
        observacoes: document.getElementById('observacoes-seguro').value,
        dataRegistro: new Date().toISOString()
    };

    if (editingSeguroId) {
        const index = seguros.findIndex(s => s.id === editingSeguroId);
        seguros[index] = seguroData;
        showNotification('Seguro atualizado com sucesso!', 'success');
    } else {
        seguros.push(seguroData);
        showNotification('Seguro cadastrado com sucesso!', 'success');
    }

    localStorage.setItem('seguros', JSON.stringify(seguros));
    this.reset();
    cancelarEdicao();
    atualizarListaSeguros();
    atualizarEstatisticas();
});

function atualizarListaSeguros() {
    const lista = document.getElementById('lista-seguros');
    const emptyState = document.getElementById('empty-seguros');
    const alertsSection = document.getElementById('alerts-seguros');
    const alertsGrid = document.getElementById('alerts-seguros-grid');
    
    if (seguros.length === 0) {
        lista.innerHTML = '';
        emptyState.style.display = 'block';
        alertsSection.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    alertsSection.style.display = 'block';
    
    alertsGrid.innerHTML = '';
    
    lista.innerHTML = seguros.map(seguro => {
        const veiculo = veiculos.find(v => v.id === parseInt(seguro.veiculoId));
        const vencimento = new Date(seguro.vencimento);
        const hoje = new Date();
        const diasParaVencer = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
        
        let status, statusText, statusClass;
        
        if (diasParaVencer < 0) {
            status = 'vencido';
            statusText = 'Vencido';
            statusClass = 'status-vencido';
        } else if (diasParaVencer <= 30) {
            status = 'alerta';
            statusText = `Vence em ${diasParaVencer} dias`;
            statusClass = 'status-alerta';
            
            alertsGrid.innerHTML += `
                <div class="alert-card">
                    <div class="alert-icon">⚠️</div>
                    <div class="alert-content">
                        <h5>${seguro.seguradora} - ${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo'}</h5>
                        <p>Apólice ${seguro.apolice} vence em ${vencimento.toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            `;
        } else {
            status = 'ativo';
            statusText = 'Ativo';
            statusClass = 'status-ativo';
        }

        return `
            <tr>
                <td><strong>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</strong></td>
                <td>${seguro.seguradora}</td>
                <td>${seguro.apolice}</td>
                <td class="monetary-value">R$ ${seguro.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td>${vencimento.toLocaleDateString('pt-BR')}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editarSeguro(${seguro.id})">
                        <span>✏️</span> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirSeguro(${seguro.id})">
                        <span>🗑️</span> Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (alertsGrid.innerHTML === '') {
        alertsSection.style.display = 'none';
    }
}

function atualizarEstatisticas() {
    const hoje = new Date();
    
    const segurosAtivos = seguros.filter(seguro => {
        const vencimento = new Date(seguro.vencimento);
        return vencimento >= hoje;
    }).length;
    
    document.getElementById('total-seguros').textContent = segurosAtivos;
    
    const investimentoTotal = seguros.reduce((total, seguro) => total + parseFloat(seguro.valor), 0);
    document.getElementById('investimento-seguros').textContent = `R$ ${investimentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    document.getElementById('veiculos-segurados').textContent = new Set(seguros.map(s => s.veiculoId)).size;
    document.getElementById('investimento-total').textContent = `R$ ${investimentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('protecao-ativa').textContent = `${segurosAtivos} veículos`;
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
    atualizarListaSeguros();
    atualizarEstatisticas();
});