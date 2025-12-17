// js/graficos.js - Sistema de gráficos simplificado e funcional

class GraficosSistema {
    constructor() {
        this.chart = null;
        this.periodo = 30;
        this.dataInicio = null;
        this.dataFim = null;
        this.inicializado = false;
        this.canvasId = 'grafico-glicemia';
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarDataPadrao();
        this.configurarEventos();
        
        // Verificar se o canvas existe
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            console.error(`Canvas com ID '${this.canvasId}' não encontrado!`);
            return;
        }
        
        // Verificar se Chart.js está carregado
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está carregado!');
            return;
        }
        
        this.criarGrafico();
        this.atualizarGrafico();
        this.inicializado = true;
        
        console.log('Sistema de gráficos inicializado');
    }

    configurarDataPadrao() {
        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - this.periodo);
        
        this.dataInicio = inicio.toISOString().split('T')[0];
        this.dataFim = fim.toISOString().split('T')[0];
        
        // Configurar inputs se existirem
        const inputInicio = document.getElementById('grafico-inicio');
        const inputFim = document.getElementById('grafico-fim');
        
        if (inputInicio) inputInicio.value = this.dataInicio;
        if (inputFim) inputFim.value = this.dataFim;
    }

    configurarEventos() {
        // Período do gráfico
        const selectPeriodo = document.getElementById('periodo-grafico');
        if (selectPeriodo) {
            selectPeriodo.addEventListener('change', (e) => {
                if (e.target.value === 'personalizado') {
                    const periodoPersonalizado = document.getElementById('periodo-personalizado');
                    if (periodoPersonalizado) {
                        periodoPersonalizado.style.display = 'block';
                        // Configurar datas padrão para personalizado
                        const hoje = new Date();
                        const umaSemanaAtras = new Date();
                        umaSemanaAtras.setDate(hoje.getDate() - 7);
                        
                        document.getElementById('grafico-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
                        document.getElementById('grafico-fim').value = hoje.toISOString().split('T')[0];
                        
                        this.dataInicio = umaSemanaAtras.toISOString().split('T')[0];
                        this.dataFim = hoje.toISOString().split('T')[0];
                    }
                } else {
                    const periodoPersonalizado = document.getElementById('periodo-personalizado');
                    if (periodoPersonalizado) periodoPersonalizado.style.display = 'none';
                    this.periodo = parseInt(e.target.value);
                    this.configurarDataPadrao();
                    this.atualizarGrafico();
                }
            });
        }

        // Datas personalizadas
        const inputInicio = document.getElementById('grafico-inicio');
        const inputFim = document.getElementById('grafico-fim');
        
        if (inputInicio) {
            inputInicio.addEventListener('change', () => {
                this.dataInicio = inputInicio.value;
                this.atualizarGrafico();
            });
        }
        
        if (inputFim) {
            inputFim.addEventListener('change', () => {
                this.dataFim = inputFim.value;
                this.atualizarGrafico();
            });
        }
        
        // Botão de atualizar
        const btnAtualizar = document.getElementById('atualizar-grafico');
        if (btnAtualizar) {
            btnAtualizar.addEventListener('click', () => {
                this.atualizarGrafico();
            });
        }
    }

    criarGrafico() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;
        
        // Limpar gráfico anterior se existir
        if (this.chart) {
            this.chart.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        // Configuração do gráfico
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Glicemia (mg/dL)',
                    data: [],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4361ee',
                    pointBorderColor: '#ffffff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        titleFont: {
                            family: "'Inter', sans-serif"
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif"
                        },
                        callbacks: {
                            label: (context) => {
                                const valor = context.parsed.y;
                                return `Glicemia: ${valor} mg/dL (${this.getClassificacao(valor)})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 50,
                        suggestedMax: 300,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + ' mg/dL';
                            },
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        },
                        title: {
                            display: true,
                            text: 'Glicemia (mg/dL)',
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        },
                        title: {
                            display: true,
                            text: 'Data',
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: "'Inter', sans-serif"
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    atualizarGrafico() {
        if (!this.chart) {
            console.warn('Gráfico não criado ainda. Tentando inicializar...');
            this.inicializar();
            return;
        }
        
        const dados = this.obterDadosFiltrados();
        
        if (dados.length === 0) {
            this.chart.data.labels = ['Sem dados'];
            this.chart.data.datasets[0].data = [0];
            this.chart.update();
            
            // Mostrar mensagem
            this.mostrarMensagemSemDados();
            return;
        }

        // Preparar dados para o gráfico
        const { labels, valores } = this.processarDados(dados);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = valores;
        
        // Atualizar cores dos pontos
        const coresPontos = valores.map(v => this.getCorGlicemia(v));
        this.chart.data.datasets[0].pointBackgroundColor = coresPontos;
        
        // Atualizar título do dataset
        this.chart.data.datasets[0].label = `Glicemia (${dados.length} registros)`;
        
        this.chart.update();
        
        console.log(`Gráfico atualizado com ${dados.length} registros`);
    }

    obterDadosFiltrados() {
        if (!window.dados?.glicemias) return [];
        
        return window.dados.glicemias.filter(glicemia => {
            const dataGlicemia = new Date(glicemia.data);
            const dataInicio = new Date(this.dataInicio);
            const dataFim = new Date(this.dataFim);
            dataFim.setHours(23, 59, 59); // Incluir todo o dia
            
            return dataGlicemia >= dataInicio && dataGlicemia <= dataFim;
        }).sort((a, b) => a.timestamp - b.timestamp);
    }

    processarDados(dados) {
        const labels = [];
        const valores = [];
        
        dados.forEach((glicemia, index) => {
            // Formatar label: dia/mês hora
            const data = new Date(glicemia.data);
            let label = `${data.getDate()}/${data.getMonth() + 1}`;
            
            // Se houver múltiplas medições no mesmo dia, adicionar hora
            if (dados.filter(d => d.data === glicemia.data).length > 1) {
                label += ` ${glicemia.hora.substring(0, 5)}`;
            }
            
            labels.push(label);
            valores.push(glicemia.glicemia);
        });
        
        return { labels, valores };
    }

    getClassificacao(valor) {
        if (valor < 70) return 'Baixa';
        if (valor <= 180) return 'Normal';
        if (valor <= 250) return 'Alta';
        return 'Muito Alta';
    }

    getCorGlicemia(valor) {
        if (valor < 70) return '#4cc9f0';    // Azul - Baixa
        if (valor <= 180) return '#2ecc71';  // Verde - Normal
        if (valor <= 250) return '#ff9e00';  // Laranja - Alta
        return '#e74c3c';                   // Vermelho - Muito Alta
    }

    mostrarMensagemSemDados() {
        const container = document.querySelector('.grafico-container');
        if (!container) return;
        
        // Remover mensagens anteriores
        const mensagensAntigas = container.querySelectorAll('.sem-dados-grafico');
        mensagensAntigas.forEach(msg => msg.remove());
        
        const mensagem = document.createElement('div');
        mensagem.className = 'sem-dados-grafico';
        mensagem.innerHTML = `
            <div class="mensagem-conteudo">
                <i class="fas fa-chart-line"></i>
                <h4>Nenhum dado disponível</h4>
                <p>Não há registros de glicemia para o período selecionado</p>
                <p class="subtitulo">Adicione registros na seção "Registrar Glicemia"</p>
                <button id="ir-para-registro" class="btn btn-primary btn-sm">
                    <i class="fas fa-plus"></i> Adicionar Registro
                </button>
            </div>
        `;
        
        container.appendChild(mensagem);
        
        // Adicionar evento ao botão
        document.getElementById('ir-para-registro').addEventListener('click', () => {
            const linkRegistro = document.querySelector('.nav-link[data-section="registro"]');
            if (linkRegistro) {
                linkRegistro.click();
            }
        });
    }

    criarGraficoRelatorio(containerId, dados) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container '${containerId}' não encontrado`);
            return null;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Criar canvas
        const canvas = document.createElement('canvas');
        const canvasId = `grafico-relatorio-${Date.now()}`;
        canvas.id = canvasId;
        canvas.style.width = '100%';
        canvas.style.height = '300px';
        container.appendChild(canvas);
        
        if (!dados || dados.length === 0) {
            container.innerHTML = '<p class="sem-dados">Não há dados para exibir gráfico</p>';
            return null;
        }
        
        // Ordenar dados
        const dadosOrdenados = dados.sort((a, b) => a.timestamp - b.timestamp);
        const labels = dadosOrdenados.map(g => {
            const data = new Date(g.data);
            return `${data.getDate()}/${data.getMonth() + 1} ${g.hora.substring(0, 5)}`;
        });
        const valores = dadosOrdenados.map(g => g.glicemia);
        
        // Cores dos pontos
        const coresPontos = valores.map(v => this.getCorGlicemia(v));
        
        // Criar gráfico
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Glicemia (mg/dL)',
                    data: valores,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: coresPontos,
                    pointBorderColor: '#ffffff',
                    pointRadius: 3,
                    pointBorderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Glicemia (mg/dL)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Data/Hora'
                        }
                    }
                }
            }
        });
    }

    exportarComoImagem() {
        if (!this.chart) return;
        
        const link = document.createElement('a');
        const canvas = document.getElementById(this.canvasId);
        
        if (canvas) {
            link.download = `grafico-glicemia-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.graficosSistema = new GraficosSistema();
    
    // Inicializar gráfico quando a seção for ativada
    document.addEventListener('secaoAtivada', (e) => {
        if (e.detail.secaoId === 'grafico') {
            setTimeout(() => {
                if (window.graficosSistema && typeof window.graficosSistema.inicializar === 'function') {
                    window.graficosSistema.inicializar();
                }
            }, 300);
        }
    });
    
    // Inicializar agora se a seção de gráficos já estiver ativa
    if (document.getElementById('grafico')?.classList.contains('ativa')) {
        setTimeout(() => {
            if (window.graficosSistema && typeof window.graficosSistema.inicializar === 'function') {
                window.graficosSistema.inicializar();
            }
        }, 500);
    }
});