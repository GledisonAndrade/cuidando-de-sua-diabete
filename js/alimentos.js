// js/alimentos.js - Gerenciamento de alimentos
document.addEventListener('DOMContentLoaded', function() {
    const formAlimento = document.getElementById('form-alimento');
    const listaAlimentos = document.getElementById('lista-alimentos');
    const filtroAlimento = document.getElementById('filtro-alimento');
    const btnLimparAlimentos = document.getElementById('limpar-filtro-alimento');

    // Inicializar dados de alimentos
    if (!window.dados.alimentos) {
        window.dados.alimentos = [];
    }

    // Formulário de alimento
    if (formAlimento) {
        // Configurar data/hora padrão
        const hoje = new Date().toISOString().split('T')[0];
        const horaAtual = new Date().toTimeString().split(':').slice(0, 2).join(':');
        
        document.getElementById('alimento-data').value = hoje;
        document.getElementById('alimento-hora').value = horaAtual;
        
        formAlimento.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('alimento-nome').value.trim();
            const quantidade = document.getElementById('alimento-quantidade').value;
            const carboidratos = document.getElementById('alimento-carboidratos').value;
            const categoria = document.getElementById('alimento-categoria').value;
            const data = document.getElementById('alimento-data').value;
            const hora = document.getElementById('alimento-hora').value;
            const observacao = document.getElementById('alimento-observacao').value.trim();
            
            if (!nome) {
                mostrarNotificacao('Informe o nome do alimento', 'erro');
                return;
            }
            
            const alimento = {
                id: Date.now(),
                nome: nome,
                quantidade: quantidade ? parseFloat(quantidade) : null,
                carboidratos: carboidratos ? parseFloat(carboidratos) : null,
                categoria: categoria,
                data: data,
                hora: hora,
                observacao: observacao,
                timestamp: new Date(`${data}T${hora}`).getTime(),
                indiceGlicemico: estimarIndiceGlicemico(nome, categoria)
            };
            
            window.dados.alimentos.push(alimento);
            salvarDados();
            atualizarListaAlimentos();
            
            // Limpar formulário
            this.reset();
            document.getElementById('alimento-data').value = hoje;
            document.getElementById('alimento-hora').value = horaAtual;
            
            mostrarNotificacao('Alimento registrado com sucesso!', 'sucesso');
        });
    }

    // Estimar índice glicêmico baseado no alimento
    function estimarIndiceGlicemico(nome, categoria) {
        const alimentosBaixoIG = ['maçã', 'pera', 'laranja', 'amêndoa', 'noz', 'aveia', 'batata-doce', 'feijão', 'lentilha', 'grão-de-bico'];
        const alimentosAltoIG = ['arroz branco', 'pão branco', 'batata', 'mel', 'açúcar', 'refrigerante', 'sorvete', 'bolacha'];
        
        const nomeLower = nome.toLowerCase();
        
        if (alimentosBaixoIG.some(a => nomeLower.includes(a))) {
            return 'Baixo';
        } else if (alimentosAltoIG.some(a => nomeLower.includes(a))) {
            return 'Alto';
        }
        
        switch(categoria) {
            case 'cereais': return 'Médio-Alto';
            case 'frutas': return 'Baixo-Médio';
            case 'vegetais': return 'Baixo';
            case 'proteinas': return 'Baixo';
            case 'laticinios': return 'Baixo';
            case 'doces': return 'Alto';
            default: return 'Médio';
        }
    }

    // Atualizar lista de alimentos
    function atualizarListaAlimentos() {
        if (!listaAlimentos) return;
        
        listaAlimentos.innerHTML = '';
        
        let alimentosFiltrados = window.dados.alimentos;
        
        // Aplicar filtro por categoria
        if (filtroAlimento && filtroAlimento.value !== 'todos') {
            alimentosFiltrados = alimentosFiltrados.filter(a => a.categoria === filtroAlimento.value);
        }
        
        // Ordenar por data (mais recente primeiro)
        alimentosFiltrados.sort((a, b) => b.timestamp - a.timestamp);
        
        if (alimentosFiltrados.length === 0) {
            listaAlimentos.innerHTML = `
                <div class="sem-dados">
                    <i class="fas fa-utensils"></i>
                    <p>Nenhum alimento registrado</p>
                </div>
            `;
            return;
        }
        
        alimentosFiltrados.forEach(alimento => {
            const item = document.createElement('div');
            item.className = 'alimento-item';
            
            const corIndice = alimento.indiceGlicemico === 'Baixo' ? '#2ecc71' : 
                             alimento.indiceGlicemico === 'Alto' ? '#e74c3c' : '#f39c12';
            
            item.innerHTML = `
                <div class="alimento-info">
                    <div class="alimento-cabecalho">
                        <strong>${alimento.nome}</strong>
                        <span class="alimento-categoria">${formatarCategoria(alimento.categoria)}</span>
                        <span class="alimento-indice" style="background: ${corIndice}">
                            IG: ${alimento.indiceGlicemico}
                        </span>
                    </div>
                    
                    <div class="alimento-detalhes">
                        ${alimento.quantidade ? `<span><i class="fas fa-weight"></i> ${alimento.quantidade}g</span>` : ''}
                        ${alimento.carboidratos ? `<span><i class="fas fa-bread-slice"></i> ${alimento.carboidratos}g carboidratos</span>` : ''}
                        <span><i class="fas fa-calendar"></i> ${formatarData(alimento.data)} ${alimento.hora}</span>
                    </div>
                    
                    ${alimento.observacao ? `<div class="alimento-obs">${alimento.observacao}</div>` : ''}
                </div>
                
                <button class="btn-excluir" data-id="${alimento.id}" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            listaAlimentos.appendChild(item);
        });
        
        // Adicionar eventos aos botões de excluir
        document.querySelectorAll('.alimento-item .btn-excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                excluirAlimento(id);
            });
        });
    }

    // Excluir alimento
    function excluirAlimento(id) {
        if (confirm('Excluir este registro de alimento?')) {
            window.dados.alimentos = window.dados.alimentos.filter(a => a.id !== id);
            salvarDados();
            atualizarListaAlimentos();
            mostrarNotificacao('Alimento excluído', 'sucesso');
        }
    }

    // Botão limpar filtro
    if (btnLimparAlimentos) {
        btnLimparAlimentos.addEventListener('click', function() {
            if (filtroAlimento) {
                filtroAlimento.value = 'todos';
                atualizarListaAlimentos();
            }
        });
    }

    // Formatar categoria
    function formatarCategoria(categoria) {
        const categorias = {
            'cereais': 'Cereais',
            'frutas': 'Frutas',
            'vegetais': 'Vegetais',
            'proteinas': 'Proteínas',
            'laticinios': 'Laticínios',
            'doces': 'Doces',
            'bebidas': 'Bebidas',
            'outros': 'Outros'
        };
        return categorias[categoria] || categoria;
    }

    // Formatar data
    function formatarData(data) {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Salvar dados
    function salvarDados() {
        localStorage.setItem('alimentos', JSON.stringify(window.dados.alimentos));
    }

    // Inicializar lista
    atualizarListaAlimentos();
});