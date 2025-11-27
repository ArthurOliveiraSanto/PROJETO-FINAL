        function carregarDados() {
            const veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
            const manutencoes = JSON.parse(localStorage.getItem('manutencoes')) || [];
            const documentos = JSON.parse(localStorage.getItem('documentos')) || [];
            const eventos = JSON.parse(localStorage.getItem('eventos')) || [];

            document.getElementById('total-veiculos').textContent = veiculos.length;
            document.getElementById('stats-veiculos').textContent = veiculos.length;
            document.getElementById('stats-manutencoes').textContent = manutencoes.length;
            document.getElementById('stats-documentos').textContent = documentos.length;
            document.getElementById('stats-eventos').textContent = eventos.length;

            const manutencoesFuturas = manutencoes
                .filter(m => new Date(m.data) > new Date())
                .sort((a, b) => new Date(a.data) - new Date(b.data));
            
            if (manutencoesFuturas.length > 0) {
                document.getElementById('proxima-manutencao').textContent = 
                    new Date(manutencoesFuturas[0].data).toLocaleDateString('pt-BR');
            }

            const documentosPendentes = documentos.filter(d => {
                const vencimento = new Date(d.vencimento);
                return vencimento < new Date();
            }).length;
            document.getElementById('documentos-pendentes').textContent = documentosPendentes;
        }

        document.addEventListener('DOMContentLoaded', carregarDados);