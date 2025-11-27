let eventos = JSON.parse(localStorage.getItem('eventos')) || [];
let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
let editingEventoId = null;

function toggleForm() {
    const form = document.getElementById('evento-form');
    const btn = document.getElementById('toggle-evento-btn');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.innerHTML = '<span>➖</span> Cancelar';
        popularSelectVeiculos();
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span> Novo Evento';
        cancelarEdicao();
    }
}

function popularSelectVeiculos() {
    const select = document.getElementById('veiculos-evento');
    select.innerHTML = '';
    veiculos.forEach(veiculo => {
        select.innerHTML += `<option value="${veiculo.id}">${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})</option>`;
    });
}

function cancelarEdicao() {
    editingEventoId = null;
    document.getElementById('formEvento').reset();
    document.getElementById('form-evento-title').textContent = '🎯 Novo Evento';
    document.getElementById('evento-id').value = '';
    
    const btn = document.getElementById('toggle-evento-btn');
    btn.innerHTML = '<span>➕</span> Novo Evento';
    document.getElementById('evento-form').style.display = 'none';
}

function editarEvento(id) {
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;

    editingEventoId = id;
    
    document.getElementById('evento-id').value = evento.id;
    document.getElementById('nome-evento').value = evento.nome;
    document.getElementById('data-evento').value = evento.data;
    document.getElementById('tipo-evento').value = evento.tipo;
    document.getElementById('local-evento').value = evento.local;
    document.getElementById('observacoes-evento').value = evento.observacoes || '';

    const selectVeiculos = document.getElementById('veiculos-evento');
    Array.from(selectVeiculos.options).forEach(option => {
        option.selected = evento.veiculosParticipantes?.includes(parseInt(option.value)) || false;
    });

    document.getElementById('form-evento-title').textContent = '✏️ Editar Evento';
    document.getElementById('evento-form').style.display = 'block';
    document.getElementById('toggle-evento-btn').innerHTML = '<span>➖</span> Cancelar Edição';
    document.getElementById('evento-form').scrollIntoView({ behavior: 'smooth' });
}

function excluirEvento(id) {
    if (confirm('Tem certeza que deseja excluir este evento?\nEsta ação não pode ser desfeita.')) {
        eventos = eventos.filter(e => e.id !== id);
        localStorage.setItem('eventos', JSON.stringify(eventos));
        atualizarListaEventos();
        atualizarEstatisticas();
        showNotification('Evento excluído com sucesso!', 'success');
    }
}

document.getElementById('formEvento').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectVeiculos = document.getElementById('veiculos-evento');
    const veiculosSelecionados = Array.from(selectVeiculos.selectedOptions).map(option => parseInt(option.value));

    const eventoData = {
        id: editingEventoId || Date.now(),
        nome: document.getElementById('nome-evento').value,
        data: document.getElementById('data-evento').value,
        tipo: document.getElementById('tipo-evento').value,
        local: document.getElementById('local-evento').value,
        veiculosParticipantes: veiculosSelecionados,
        observacoes: document.getElementById('observacoes-evento').value,
        dataRegistro: new Date().toISOString()
    };

    if (editingEventoId) {
        const index = eventos.findIndex(e => e.id === editingEventoId);
        eventos[index] = eventoData;
        showNotification('Evento atualizado com sucesso!', 'success');
    } else {
        eventos.push(eventoData);
        showNotification('Evento cadastrado com sucesso!', 'success');
    }

    localStorage.setItem('eventos', JSON.stringify(eventos));
    this.reset();
    cancelarEdicao();
    atualizarListaEventos();
    atualizarEstatisticas();
});

function atualizarListaEventos() {
    const lista = document.getElementById('lista-eventos');
    const emptyState = document.getElementById('empty-eventos');
    const upcomingSection = document.getElementById('upcoming-events');
    const eventsGrid = document.getElementById('events-grid');
    
    if (eventos.length === 0) {
        lista.innerHTML = '';
        emptyState.style.display = 'block';
        upcomingSection.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    
    const hoje = new Date();
    const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const eventosProximos = eventos.filter(evento => {
        const dataEvento = new Date(evento.data);
        return dataEvento >= hoje && dataEvento <= trintaDias;
    });

    if (eventosProximos.length > 0) {
        upcomingSection.style.display = 'block';
        eventsGrid.innerHTML = eventosProximos.map(evento => {
            const veiculosEvento = evento.veiculosParticipantes?.map(veiculoId => {
                const veiculo = veiculos.find(v => v.id === veiculoId);
                return veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado';
            }).join(', ') || 'Nenhum veículo selecionado';

            const tipoIcon = {
                'exposicao': '🏆',
                'leilao': '🔨',
                'encontro': '🤝',
                'competicao': '🏁',
                'feira': '🎪',
                'tour': '🗺️',
                'trackday': '🏎️'
            }[evento.tipo] || '🎪';

            return `
                <div class="event-card">
                    <div class="event-card-header">
                        <div>
                            <div class="event-card-title">${evento.nome}</div>
                            <div class="event-card-date">${new Date(evento.data).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <span class="event-card-type">${tipoIcon} ${evento.tipo}</span>
                    </div>
                    <div class="event-card-location">📍 ${evento.local}</div>
                    <div class="event-card-vehicles">
                        <strong>Veículos:</strong> ${veiculosEvento}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        upcomingSection.style.display = 'none';
    }

    lista.innerHTML = eventos.map(evento => {
        const veiculosEvento = evento.veiculosParticipantes?.map(veiculoId => {
            const veiculo = veiculos.find(v => v.id === veiculoId);
            return veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado';
        }).join(', ') || 'Nenhum';

        const tipoIcon = {
            'exposicao': '🏆',
            'leilao': '🔨',
            'encontro': '🤝',
            'competicao': '🏁',
            'feira': '🎪',
            'tour': '🗺️',
            'trackday': '🏎️'
        }[evento.tipo] || '🎪';

        return `
            <tr>
                <td><strong>${evento.nome}</strong></td>
                <td>${new Date(evento.data).toLocaleDateString('pt-BR')}</td>
                <td><span class="status-badge status-${evento.tipo}">${tipoIcon} ${evento.tipo}</span></td>
                <td>${evento.local}</td>
                <td>${veiculosEvento}</td>
                <td class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editarEvento(${evento.id})">
                        <span>✏️</span> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirEvento(${evento.id})">
                        <span>🗑️</span> Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function atualizarEstatisticas() {
    document.getElementById('total-eventos').textContent = eventos.length;
    
    const hoje = new Date();
    const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const eventosProximos = eventos.filter(evento => {
        const dataEvento = new Date(evento.data);
        return dataEvento >= hoje && dataEvento <= trintaDias;
    }).length;
    
    document.getElementById('proximos-eventos').textContent = eventosProximos;
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
    atualizarListaEventos();
    atualizarEstatisticas();
});