// js/indice.js - Cálculo de índices glicêmicos
document.addEventListener('DOMContentLoaded', function() {
    const formIndice = document.getElementById('form-indice');
    const resultadoIndice = document.getElementById('resultado-indice');
    const filtroPeriodo = document.getElementById('filtro-periodo-indice');

    // Função para calcular estatísticas de período
    function calcularIndicePeriodo(periodoDias) {
        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - periodoDias);
        
        const inicioStr = inicio.toISOString().split('T')[0];
        const fimStr = fim.toISOString().split('T')[0];
        
        const glicemiasPeriodo = window.dados.glicemias.filter(g => {
            return g.data >= inicioStr && g.data <= fimStr;
        });

        return calcularEstatisticasIndice(glicemiasPeriodo, periodoDias);
    }

    // Função principal de cálculo
    function calcularEstatisticasIndice(glicemias, periodoDias) {
        if (!glicemias || glicemias.length === 0) {
            return {
                periodo: periodoDias,
                totalRegistros: 0,
                media: 0,
                desvioPadrao: 0,
                maxima: 0,
                minima: 0,
                dentroAlvo: 0,
                percentualAlvo: 0,
                variabilidade: 0,
                tendencia: 'estável',
                classificacao: 'sem dados',
                recomendacoes: ['Nenhum registro encontrado no período selecionado.']
            };
        }

        const valores = glicemias.map(g => g.glicemia);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const maxima = Math.max(...valores);
        const minima = Math.min(...valores);
        
        // Calcular desvio padrão
        const desvio = Math.sqrt(
            valores.reduce((sq, n) => sq + Math.pow(n - media, 2), 0) / valores.length
        );
        
        // Calcular percentual dentro do alvo (70-180 mg/dL)
        const dentroAlvo = glicemias.filter(g => g.glicemia >= 70 && g.glicemia <= 180).length;
        const percentualAlvo = (dentroAlvo / glicemias.length * 100).toFixed(1);
        
        // Calcular variabilidade glicêmica
        const variabilidade = calcularVariabilidadeGlicemica(glicemias);
        
        // Determinar tendência
        const tendencia = determinarTendencia(glicemias);
        
        // Classificar controle glicêmico
        const classificacao = classificarControle(media, percentualAlvo, variabilidade);
        
        // Gerar recomendações
        const recomendacoes = gerarRecomendacoes(media, percentualAlvo, variabilidade, glicemias);

        return {
            periodo: periodoDias,
            totalRegistros: glicemias.length,
            media: parseFloat(media.toFixed(1)),
            desvioPadrao: parseFloat(desvio.toFixed(1)),
            maxima,
            minima,
            dentroAlvo,
            percentualAlvo,
            variabilidade: parseFloat(variabilidade.toFixed(1)),
            tendencia,
            classificacao,
            recomendacoes
        };
    }

    // Calcular variabilidade glicêmica
    function calcularVariabilidadeGlicemica(glicemias) {
        if (glicemias.length < 2) return 0;
        
        const valores = glicemias.map(g => g.glicemia);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const desvios = valores.map(v => Math.pow(v - media, 2));
        const variancia = desvios.reduce((a, b) => a + b, 0) / valores.length;
        return Math.sqrt(variancia);
    }

    // Determinar tendência
    function determinarTendencia(glicemias) {
        if (glicemias.length < 3) return 'estável';
        
        const primeiros = glicemias.slice(0, Math.floor(glicemias.length / 3));
        const ultimos = glicemias.slice(-Math.floor(glicemias.length / 3));
        
        const mediaInicial = primeiros.reduce((a, b) => a + b.glicemia, 0) / primeiros.length;
        const mediaFinal = ultimos.reduce((a, b) => a + b.glicemia, 0) / ultimos.length;
        
        const diferenca = mediaFinal - mediaInicial;
        
        if (diferenca > 15) return 'crescendo 📈';
        if (diferenca < -15) return 'decrescendo 📉';
        return 'estável →';
    }

    // Classificar controle glicêmico
    function classificarControle(media, percentualAlvo, variabilidade) {
        if (percentualAlvo >= 70 && media <= 154 && variabilidade <= 36) {
            return 'Excelente 👑';
        } else if (percentualAlvo >= 50 && media <= 180 && variabilidade <= 50) {
            return 'Bom 👍';
        } else if (percentualAlvo >= 30 && media <= 200 && variabilidade <= 70) {
            return 'Regular ⚠️';
        } else {
            return 'Precisa de Ajuste 🚨';
        }
    }

    // Gerar recomendações personalizadas
    function gerarRecomendacoes(media, percentualAlvo, variabilidade, glicemias) {
        const recomendacoes = [];
        
        // Baseado na média
        if (media > 180) {
            recomendacoes.push('Considere ajustar a medicação ou dieta para reduzir a glicemia média');
        } else if (media < 70) {
            recomendacoes.push('Atenção: risco de hipoglicemia. Avalie necessidade de reduzir medicação');
        }
        
        // Baseado no tempo no alvo
        if (percentualAlvo < 50) {
            recomendacoes.push('Aumente o monitoramento para identificar padrões de variação');
        }
        
        // Baseado na variabilidade
        if (variabilidade > 50) {
            recomendacoes.push('Alta variabilidade: tente manter horários regulares de refeições e medicação');
        }
        
        // Contagem de hipoglicemias
        const hipoglicemias = glicemias.filter(g => g.glicemia < 70).length;
        if (hipoglicemias > 0) {
            recomendacoes.push(`${hipoglicemias} episódio(s) de hipoglicemia registrado(s). Fique atento aos sintomas`);
        }
        
        // Recomendações gerais
        recomendacoes.push('Continue monitorando regularmente');
        recomendacoes.push('Compartilhe esses dados com seu médico na próxima consulta');
        
        return recomendacoes;
    }

    // Atualizar exibição dos resultados
    function atualizarResultadoIndice(estatisticas) {
        if (!resultadoIndice) return;
        
        const cores = {
            'Excelente 👑': '#2ecc71',
            'Bom 👍': '#3498db',
            'Regular ⚠️': '#f39c12',
            'Precisa de Ajuste 🚨': '#e74c3c',
            'sem dados': '#95a5a6'
        };
        
        const corClassificacao = cores[estatisticas.classificacao] || '#95a5a6';
        
        resultadoIndice.innerHTML = `
            <div class="indice-header">
                <h3>Resultado do Índice Glicêmico</h3>
                <span class="periodo-info">Período: ${estatisticas.periodo} dias</span>
            </div>
            
            <div class="indice-resumo">
                <div class="classificacao-indice" style="background: ${corClassificacao}">
                    ${estatisticas.classificacao}
                </div>
                
                <div class="estatisticas-indice">
                    <div class="estatistica">
                        <div class="valor">${estatisticas.media}</div>
                        <div class="label">Média (mg/dL)</div>
                    </div>
                    <div class="estatistica">
                        <div class="valor">${estatisticas.percentualAlvo}%</div>
                        <div class="label">Dentro do Alvo</div>
                    </div>
                    <div class="estatistica">
                        <div class="valor">${estatisticas.variabilidade}</div>
                        <div class="label">Variabilidade</div>
                    </div>
                    <div class="estatistica">
                        <div class="valor">${estatisticas.tendencia}</div>
                        <div class="label">Tendência</div>
                    </div>
                </div>
                
                <div class="detalhes-indice">
                    <h4>Detalhes Estatísticos</h4>
                    <table>
                        <tr>
                            <td>Total de Registros:</td>
                            <td><strong>${estatisticas.totalRegistros}</strong></td>
                        </tr>
                        <tr>
                            <td>Glicemia Máxima:</td>
                            <td><strong>${estatisticas.maxima} mg/dL</strong></td>
                        </tr>
                        <tr>
                            <td>Glicemia Mínima:</td>
                            <td><strong>${estatisticas.minima} mg/dL</strong></td>
                        </tr>
                        <tr>
                            <td>Desvio Padrão:</td>
                            <td><strong>${estatisticas.desvioPadrao}</strong></td>
                        </tr>
                    </table>
                </div>
                
                <div class="recomendacoes-indice">
                    <h4>Recomendações</h4>
                    <ul>
                        ${estatisticas.recomendacoes.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="legenda-indice">
                    <p><small>⚠️ Alvo glicêmico: 70-180 mg/dL | Variabilidade ideal: ≤36</small></p>
                </div>
            </div>
        `;
    }

    // Inicializar formulário
    if (formIndice) {
        // Configurar data padrão para 30 dias atrás
        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - 30);
        
        document.getElementById('indice-inicio').value = inicio.toISOString().split('T')[0];
        document.getElementById('indice-fim').value = fim.toISOString().split('T')[0];
        
        formIndice.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inicio = document.getElementById('indice-inicio').value;
            const fim = document.getElementById('indice-fim').value;
            
            if (!inicio || !fim) {
                mostrarNotificacao('Selecione o período para cálculo', 'erro');
                return;
            }
            
            const glicemiasPeriodo = window.dados.glicemias.filter(g => {
                return g.data >= inicio && g.data <= fim;
            }).sort((a, b) => a.timestamp - b.timestamp);
            
            const dias = Math.round((new Date(fim) - new Date(inicio)) / (1000 * 60 * 60 * 24));
            
            const estatisticas = calcularEstatisticasIndice(glicemiasPeriodo, dias);
            atualizarResultadoIndice(estatisticas);
            
            mostrarNotificacao('Índice calculado com sucesso!', 'sucesso');
        });
    }

    // Filtro rápido de período
    if (filtroPeriodo) {
        filtroPeriodo.addEventListener('change', function(e) {
            const periodo = parseInt(e.target.value);
            if (periodo > 0) {
                const estatisticas = calcularIndicePeriodo(periodo);
                atualizarResultadoIndice(estatisticas);
            }
        });
    }

    // Calcular índice inicial (30 dias)
    setTimeout(() => {
        if (filtroPeriodo) {
            const estatisticas = calcularIndicePeriodo(30);
            atualizarResultadoIndice(estatisticas);
        }
    }, 500);

    // Função auxiliar para notificações
    function mostrarNotificacao(mensagem, tipo) {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.innerHTML = `
            <i class="fas fa-${tipo === 'sucesso' ? 'check-circle' : tipo === 'erro' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        `;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.classList.add('fade-out');
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, 3000);
    }
});