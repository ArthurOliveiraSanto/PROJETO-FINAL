let documentos = JSON.parse(localStorage.getItem('documentos')) || [];
let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
let editingDocumentoId = null;

function toggleForm() {
    const form = document.getElementById('documento-form');
    const btn = document.getElementById('toggle-documento-btn');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.innerHTML = '<span>➖</span> Cancelar';
        popularSelectVeiculos();
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span> Adicionar Documento';
        cancelarEdicao();
    }
}

function popularSelectVeiculos() {
    const select = document.getElementById('veiculo-documento');
    select.innerHTML = '<option value="">Selecione um veículo</option>';
    veiculos.forEach(veiculo => {
        select.innerHTML += `<option value="${veiculo.id}">${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})</option>`;
    });
}

function cancelarEdicao() {
    editingDocumentoId = null;
    document.getElementById('formDocumento').reset();
    document.getElementById('form-documento-title').textContent = '📋 Novo Documento';
    document.getElementById('documento-id').value = '';
    
    const btn = document.getElementById('toggle-documento-btn');
    btn.innerHTML = '<span>➕</span> Adicionar Documento';
    document.getElementById('documento-form').style.display = 'none';
}

function editarDocumento(id) {
    const documento = documentos.find(d => d.id === id);
    if (!documento) return;

    editingDocumentoId = id;
    
    document.getElementById('documento-id').value = documento.id;
    document.getElementById('veiculo-documento').value = documento.veiculoId;
    document.getElementById('tipo-documento').value = documento.tipo;
    document.getElementById('numero-documento').value = documento.numero || '';
    document.getElementById('vencimento-documento').value = documento.vencimento;
    document.getElementById('observacoes-documento').value = documento.observacoes || '';

    document.getElementById('form-documento-title').textContent = '✏️ Editar Documento';
    document.getElementById('documento-form').style.display = 'block';
    document.getElementById('toggle-documento-btn').innerHTML = '<span>➖</span> Cancelar Edição';
    document.getElementById('documento-form').scrollIntoView({ behavior: 'smooth' });
}

function excluirDocumento(id) {
    if (confirm('Tem certeza que deseja excluir este documento?\nEsta ação não pode ser desfeita.')) {
        documentos = documentos.filter(d => d.id !== id);
        localStorage.setItem('documentos', JSON.stringify(documentos));
        atualizarListaDocumentos();
        atualizarEstatisticas();
        showNotification('Documento excluído com sucesso!', 'success');
    }
}

document.getElementById('formDocumento').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const documentoData = {
        id: editingDocumentoId || Date.now(),
        veiculoId: document.getElementById('veiculo-documento').value,
        tipo: document.getElementById('tipo-documento').value,
        numero: document.getElementById('numero-documento').value,
        vencimento: document.getElementById('vencimento-documento').value,
        observacoes: document.getElementById('observacoes-documento').value,
        dataRegistro: new Date().toISOString()
    };

    if (editingDocumentoId) {
        const index = documentos.findIndex(d => d.id === editingDocumentoId);
        documentos[index] = documentoData;
        showNotification('Documento atualizado com sucesso!', 'success');
    } else {
        documentos.push(documentoData);
        showNotification('Documento cadastrado com sucesso!', 'success');
    }

    localStorage.setItem('documentos', JSON.stringify(documentos));
    this.reset();
    cancelarEdicao();
    atualizarListaDocumentos();
    atualizarEstatisticas();
});

function atualizarListaDocumentos() {
    const lista = document.getElementById('lista-documentos');
    const emptyState = document.getElementById('empty-documentos');
    const alertsSection = document.getElementById('alerts-section');
    const alertsGrid = document.getElementById('alerts-grid');
    
    if (documentos.length === 0) {
        lista.innerHTML = '';
        emptyState.style.display = 'block';
        alertsSection.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    alertsSection.style.display = 'block';
    
    alertsGrid.innerHTML = '';
    
    lista.innerHTML = documentos.map(documento => {
        const veiculo = veiculos.find(v => v.id === parseInt(documento.veiculoId));
        const vencimento = new Date(documento.vencimento);
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
                        <h5>${documento.tipo} - ${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo'}</h5>
                        <p>Vence em ${vencimento.toLocaleDateString('pt-BR')} (${diasParaVencer} dias)</p>
                    </div>
                </div>
            `;
        } else {
            status = 'ok';
            statusText = 'Em dia';
            statusClass = 'status-ok';
        }

        const tipoIcon = {
            'CRLV': '🚗',
            'IPVA': '💰',
            'seguro': '🛡️',
            'nota': '🧾',
            'documento': '📋',
            'laudo': '🔧',
            'licenciamento': '📄',
            'multas': '🚨'
        }[documento.tipo] || '📄';

        return `
            <tr>
                <td><strong>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</strong></td>
                <td>${tipoIcon} ${documento.tipo}</td>
                <td>${documento.numero || '-'}</td>
                <td>${vencimento.toLocaleDateString('pt-BR')}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editarDocumento(${documento.id})">
                        <span>✏️</span> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirDocumento(${documento.id})">
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
    document.getElementById('total-documentos').textContent = documentos.length;
    
    const hoje = new Date();
    const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const documentosPendentes = documentos.filter(d => {
        const vencimento = new Date(d.vencimento);
        return vencimento <= trintaDias && vencimento >= hoje;
    }).length;
    
    document.getElementById('documentos-pendentes').textContent = documentosPendentes;
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
    atualizarListaDocumentos();
    atualizarEstatisticas();
});