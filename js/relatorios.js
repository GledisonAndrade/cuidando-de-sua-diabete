// js/relatorios.js - Sistema de relatórios completo e funcional

class RelatoriosSistema {
    constructor() {
        this.relatorioAtual = null;
        this.graficoRelatorio = null;
        this.dadosCarregados = false;
        this.pdfGerado = false;
    }

    inicializar() {
        this.configurarDatasPadrao();
        this.configurarEventos();
        this.dadosCarregados = true;
        
        // Habilitar botão de períodos rápidos
        this.habilitarPeriodosRapidos();
        
        console.log('Sistema de relatórios inicializado');
        
        // Mostrar instrução inicial
        setTimeout(() => {
            if (document.getElementById('previa-relatorio')?.innerHTML === '') {
                this.mostrarInstrucaoInicial();
            }
        }, 500);
    }

    configurarDatasPadrao() {
        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - 30);
        
        const inicioInput = document.getElementById('relatorio-periodo-inicio');
        const fimInput = document.getElementById('relatorio-periodo-fim');
        
        if (inicioInput && fimInput) {
            inicioInput.value = inicio.toISOString().split('T')[0];
            fimInput.value = fim.toISOString().split('T')[0];
        }
    }

    habilitarPeriodosRapidos() {
        const periodosRapidos = document.querySelector('.periodos-rapidos');
        if (periodosRapidos) {
            periodosRapidos.style.display = 'block';
        }
    }

    configurarEventos() {
        // Botões de período rápido
        document.querySelectorAll('.periodo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const dias = parseInt(e.target.dataset.dias);
                this.configurarPeriodoRapido(dias);
                
                document.querySelectorAll('.periodo-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Formulário de relatório
        const formRelatorio = document.getElementById('form-relatorio');
        if (formRelatorio) {
            formRelatorio.addEventListener('submit', (e) => {
                e.preventDefault();
                this.gerarRelatorio();
            });
        }

        // Botão baixar PDF
        const btnBaixarPDF = document.getElementById('baixar-relatorio-pdf');
        if (btnBaixarPDF) {
            btnBaixarPDF.addEventListener('click', () => {
                this.baixarPDF();
            });
        }
    }

    configurarPeriodoRapido(dias) {
        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - dias);
        
        const inicioInput = document.getElementById('relatorio-periodo-inicio');
        const fimInput = document.getElementById('relatorio-periodo-fim');
        
        if (inicioInput && fimInput) {
            inicioInput.value = inicio.toISOString().split('T')[0];
            fimInput.value = fim.toISOString().split('T')[0];
        }
    }

    mostrarInstrucaoInicial() {
        const container = document.getElementById('previa-relatorio');
        if (!container) return;
        
        container.innerHTML = `
            <div class="instrucao-relatorio">
                <div class="instrucao-conteudo">
                    <i class="fas fa-file-medical"></i>
                    <h3>Gerar Relatório Médico</h3>
                    <p>Configure o período desejado e clique em "Gerar Relatório" para visualizar um relatório completo do seu monitoramento glicêmico.</p>
                    
                    <div class="instrucao-passos">
                        <div class="passo">
                            <span class="passo-numero">1</span>
                            <div>
                                <strong>Selecione o período</strong>
                                <p>Use os botões rápidos ou selecione datas personalizadas</p>
                            </div>
                        </div>
                        <div class="passo">
                            <span class="passo-numero">2</span>
                            <div>
                                <strong>Escolha o tipo</strong>
                                <p>Selecione entre relatório completo, apenas glicemia ou simples</p>
                            </div>
                        </div>
                        <div class="passo">
                            <span class="passo-numero">3</span>
                            <div>
                                <strong>Gere e visualize</strong>
                                <p>Clique em "Gerar Relatório" para visualizar o resultado</p>
                            </div>
                        </div>
                        <div class="passo">
                            <span class="passo-numero">4</span>
                            <div>
                                <strong>Baixe em PDF</strong>
                                <p>Após gerar, clique em "Baixar PDF" para salvar o relatório</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="instrucao-dicas">
                        <p><strong>💡 Dica:</strong> Para melhores resultados, tenha pelo menos 7 dias de registros.</p>
                    </div>
                </div>
            </div>
        `;
    }

    async gerarRelatorio() {
        const inicio = document.getElementById('relatorio-periodo-inicio').value;
        const fim = document.getElementById('relatorio-periodo-fim').value;
        const tipo = document.getElementById('tipo-relatorio').value;

        if (!inicio || !fim) {
            this.mostrarNotificacao('Preencha as datas do relatório', 'erro');
            return;
        }

        if (new Date(inicio) > new Date(fim)) {
            this.mostrarNotificacao('Data inicial não pode ser maior que data final', 'erro');
            return;
        }

        // Mostrar loading
        this.mostrarLoading(true);

        try {
            const dados = this.obterDadosRelatorio(inicio, fim);
            
            if (dados.length === 0) {
                this.mostrarNotificacao('Nenhum registro encontrado no período selecionado', 'erro');
                this.mostrarLoading(false);
                
                // Mostrar mensagem de sem dados
                const container = document.getElementById('previa-relatorio');
                if (container) {
                    container.innerHTML = `
                        <div class="sem-dados">
                            <i class="fas fa-database"></i>
                            <h3>Nenhum dado encontrado</h3>
                            <p>Não há registros de glicemia no período de <strong>${this.formatarDataBrasil(inicio)}</strong> a <strong>${this.formatarDataBrasil(fim)}</strong></p>
                            <p class="dica">Adicione registros na seção "Registrar Glicemia"</p>
                        </div>
                    `;
                }
                return;
            }
            
            const estatisticas = this.calcularEstatisticas(dados);
            const conteudo = this.gerarConteudoRelatorio(inicio, fim, tipo, estatisticas, dados);
            
            this.relatorioAtual = { inicio, fim, tipo, dados, estatisticas, conteudo };
            this.exibirRelatorio(conteudo);
            
            // Habilitar botão de download
            const btnBaixarPDF = document.getElementById('baixar-relatorio-pdf');
            if (btnBaixarPDF) {
                btnBaixarPDF.disabled = false;
                btnBaixarPDF.classList.remove('btn-secondary');
                btnBaixarPDF.classList.add('btn-success');
                btnBaixarPDF.innerHTML = '<i class="fas fa-download"></i> Baixar PDF';
                this.pdfGerado = true;
            }
            
            this.mostrarNotificacao('Relatório gerado com sucesso! Agora você pode baixar o PDF.', 'sucesso');

        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            this.mostrarNotificacao('Erro ao gerar relatório. Tente novamente.', 'erro');
        } finally {
            this.mostrarLoading(false);
        }
    }

    obterDadosRelatorio(inicio, fim) {
        // Garantir que window.dados existe
        if (!window.dados) {
            window.dados = {
                glicemias: JSON.parse(localStorage.getItem('glicemias')) || [],
                metas: JSON.parse(localStorage.getItem('metas')) || [],
                alimentos: JSON.parse(localStorage.getItem('alimentos')) || []
            };
        }
        
        if (!window.dados.glicemias || window.dados.glicemias.length === 0) {
            return [];
        }
        
        return window.dados.glicemias.filter(g => {
            return g.data >= inicio && g.data <= fim;
        }).sort((a, b) => a.timestamp - b.timestamp);
    }

    calcularEstatisticas(dados) {
        if (dados.length === 0) {
            return {
                media: 0,
                minima: 0,
                maxima: 0,
                percentualNormais: 0,
                desvioPadrao: 0,
                variabilidade: 0,
                totalRegistros: 0,
                hipoglicemias: 0,
                hiperglicemias: 0,
                mediaPosPrandial: 0,
                mediaJejum: 0
            };
        }

        const valores = dados.map(g => g.glicemia);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const minima = Math.min(...valores);
        const maxima = Math.max(...valores);
        
        const normais = dados.filter(g => g.glicemia >= 70 && g.glicemia <= 180).length;
        const percentualNormais = (normais / dados.length * 100).toFixed(1);
        
        const hipoglicemias = dados.filter(g => g.glicemia < 70).length;
        const hiperglicemias = dados.filter(g => g.glicemia > 180).length;
        
        // Calcular desvio padrão
        const desvio = Math.sqrt(
            valores.reduce((sq, n) => sq + Math.pow(n - media, 2), 0) / valores.length
        );
        
        // Calcular variabilidade
        const variabilidade = this.calcularVariabilidade(dados);
        
        // Calcular média pós-prandial (após refeições - baseado em horários)
        const posPrandial = dados.filter(g => {
            const hora = parseInt(g.hora.split(':')[0]);
            return (hora >= 12 && hora <= 14) || (hora >= 19 && hora <= 21);
        });
        const mediaPosPrandial = posPrandial.length > 0 ? 
            posPrandial.reduce((a, b) => a + b.glicemia, 0) / posPrandial.length : 0;
        
        // Calcular média em jejum (manhã cedo)
        const jejum = dados.filter(g => {
            const hora = parseInt(g.hora.split(':')[0]);
            return hora >= 6 && hora <= 9;
        });
        const mediaJejum = jejum.length > 0 ? 
            jejum.reduce((a, b) => a + b.glicemia, 0) / jejum.length : 0;

        return {
            media: parseFloat(media.toFixed(1)),
            minima,
            maxima,
            percentualNormais,
            desvioPadrao: parseFloat(desvio.toFixed(1)),
            variabilidade: parseFloat(variabilidade.toFixed(1)),
            totalRegistros: dados.length,
            hipoglicemias,
            hiperglicemias,
            mediaPosPrandial: parseFloat(mediaPosPrandial.toFixed(1)),
            mediaJejum: parseFloat(mediaJejum.toFixed(1))
        };
    }

    calcularVariabilidade(dados) {
        if (dados.length < 2) return 0;
        
        const valores = dados.map(g => g.glicemia);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const desvios = valores.map(v => Math.abs(v - media));
        return desvios.reduce((a, b) => a + b, 0) / valores.length;
    }

    formatarDataBrasil(data) {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    gerarConteudoRelatorio(inicio, fim, tipo, estatisticas, dados) {
        const dataGeracao = new Date();
        const formatoData = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formatoHora = { hour: '2-digit', minute: '2-digit' };
        
        let conteudo = `
            <div class="relatorio-medico-profissional">
                <!-- Cabeçalho -->
                <div class="cabecalho-relatorio">
                    <div class="logo-relatorio">
                        <i class="fas fa-heartbeat"></i>
                        <div>
                            <h1>DiabetesCare</h1>
                            <p>Sistema de Monitoramento Glicêmico</p>
                            <p class="versao">Versão 2.0 - Relatório Médico</p>
                        </div>
                    </div>
                    <div class="info-relatorio">
                        <p><strong>Paciente:</strong> Monitoramento do Usuário</p>
                        <p><strong>Período:</strong> ${this.formatarDataBrasil(inicio)} a ${this.formatarDataBrasil(fim)}</p>
                        <p><strong>Data de Geração:</strong> ${dataGeracao.toLocaleDateString('pt-BR', formatoData)} ${dataGeracao.toLocaleTimeString('pt-BR', formatoHora)}</p>
                        <p><strong>Tipo de Relatório:</strong> ${this.obterNomeTipoRelatorio(tipo)}</p>
                    </div>
                </div>

                <!-- Resumo Executivo -->
                <div class="resumo-executivo">
                    <h2><i class="fas fa-chart-line"></i> RESUMO EXECUTIVO</h2>
                    <div class="estatisticas-destaque">
                        <div class="estatistica">
                            <div class="valor ${this.getClassificacaoMedia(estatisticas.media)}">
                                ${estatisticas.media} mg/dL
                            </div>
                            <div class="label">Glicemia Média</div>
                        </div>
                        <div class="estatistica">
                            <div class="valor ${this.getClassificacaoControle(estatisticas.percentualNormais)}">
                                ${estatisticas.percentualNormais}%
                            </div>
                            <div class="label">Dentro do Alvo</div>
                        </div>
                        <div class="estatistica">
                            <div class="valor ${estatisticas.hipoglicemias > 0 ? 'perigo' : 'seguro'}">
                                ${estatisticas.hipoglicemias}
                            </div>
                            <div class="label">Hipoglicemias</div>
                        </div>
                        <div class="estatistica">
                            <div class="valor ${estatisticas.hiperglicemias > estatisticas.totalRegistros * 0.3 ? 'perigo' : 'seguro'}">
                                ${estatisticas.hiperglicemias}
                            </div>
                            <div class="label">Hiperglicemias</div>
                        </div>
                    </div>
                </div>

                <!-- Gráfico de Tendência -->
                <div class="grafico-relatorio-secao">
                    <h2><i class="fas fa-chart-area"></i> GRÁFICO DE TENDÊNCIA GLICÊMICA</h2>
                    <div class="grafico-relatorio-container">
                        <canvas id="grafico-relatorio-canvas"></canvas>
                    </div>
                    <div class="legenda-grafico">
                        <div class="legenda-item">
                            <span class="legenda-cor baixa"></span>
                            <span>Baixa (<70 mg/dL)</span>
                        </div>
                        <div class="legenda-item">
                            <span class="legenda-cor normal"></span>
                            <span>Normal (70-180 mg/dL)</span>
                        </div>
                        <div class="legenda-item">
                            <span class="legenda-cor alta"></span>
                            <span>Alta (181-250 mg/dL)</span>
                        </div>
                        <div class="legenda-item">
                            <span class="legenda-cor muito-alta"></span>
                            <span>Muito Alta (>250 mg/dL)</span>
                        </div>
                    </div>
                </div>

                <!-- Análise Detalhada -->
                <div class="analise-detalhada">
                    <h2><i class="fas fa-stethoscope"></i> ANÁLISE DETALHADA</h2>
                    
                    <div class="tabelas-analise">
                        <table class="tabela-analise">
                            <thead>
                                <tr>
                                    <th>Parâmetro</th>
                                    <th>Valor</th>
                                    <th>Classificação</th>
                                    <th>Interpretação</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Glicemia Média</td>
                                    <td>${estatisticas.media} mg/dL</td>
                                    <td><span class="badge ${this.getClassificacaoMedia(estatisticas.media)}">${this.getClassificacaoTexto(estatisticas.media)}</span></td>
                                    <td>${this.getInterpretacaoMedia(estatisticas.media)}</td>
                                </tr>
                                <tr>
                                    <td>Tempo no Alvo</td>
                                    <td>${estatisticas.percentualNormais}%</td>
                                    <td><span class="badge ${this.getClassificacaoControle(estatisticas.percentualNormais)}">${this.getClassificacaoControleTexto(estatisticas.percentualNormais)}</span></td>
                                    <td>${this.getInterpretacaoControle(estatisticas.percentualNormais)}</td>
                                </tr>
                                <tr>
                                    <td>Variabilidade</td>
                                    <td>${estatisticas.variabilidade}</td>
                                    <td><span class="badge ${this.getClassificacaoVariabilidade(estatisticas.variabilidade)}">${this.getClassificacaoVariabilidadeTexto(estatisticas.variabilidade)}</span></td>
                                    <td>${this.getInterpretacaoVariabilidade(estatisticas.variabilidade)}</td>
                                </tr>
                                <tr>
                                    <td>Média em Jejum</td>
                                    <td>${estatisticas.mediaJejum > 0 ? estatisticas.mediaJejum + ' mg/dL' : 'N/A'}</td>
                                    <td><span class="badge ${this.getClassificacaoMedia(estatisticas.mediaJejum)}">${estatisticas.mediaJejum > 0 ? this.getClassificacaoTexto(estatisticas.mediaJejum) : 'N/A'}</span></td>
                                    <td>${estatisticas.mediaJejum > 0 ? this.getInterpretacaoMedia(estatisticas.mediaJejum) : 'Insuficientes dados em jejum'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Registros Amostrais -->
                <div class="registros-relatorio">
                    <h2><i class="fas fa-list"></i> REGISTROS DO PERÍODO (Amostra)</h2>
                    <div class="tabela-registros-container">
                        <table class="tabela-registros">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Hora</th>
                                    <th>Glicemia</th>
                                    <th>Status</th>
                                    <th>Observação</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        // Adicionar registros (limitar a 15 para não ficar muito longo)
        const registrosExibir = dados.slice(0, 15);
        registrosExibir.forEach(registro => {
            const status = this.obterStatusGlicemia(registro.glicemia);
            const classeStatus = this.obterClasseGlicemia(registro.glicemia);
            conteudo += `
                <tr>
                    <td>${this.formatarDataBrasil(registro.data)}</td>
                    <td>${registro.hora}</td>
                    <td><strong>${registro.glicemia} mg/dL</strong></td>
                    <td><span class="status ${classeStatus}">${status}</span></td>
                    <td>${registro.observacao || '-'}</td>
                </tr>
            `;
        });
        
        if (dados.length > 15) {
            conteudo += `
                <tr class="resumo-registros">
                    <td colspan="5" style="text-align: center; font-style: italic; background: #f8f9fa;">
                        <i class="fas fa-info-circle"></i> Mostrando 15 de ${dados.length} registros. Para ver todos os registros, baixe o PDF completo.
                    </td>
                </tr>
            `;
        }
        
        conteudo += `
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Recomendações -->
                <div class="recomendacoes">
                    <h2><i class="fas fa-comment-medical"></i> RECOMENDAÇÕES E ORIENTAÇÕES</h2>
                    <div class="lista-recomendacoes">
                        ${this.gerarRecomendacoes(estatisticas, dados)}
                    </div>
                </div>

                <!-- Rodapé -->
                <div class="rodape-relatorio">
                    <div class="assinatura">
                        <p>________________________________</p>
                        <p><strong>Relatório Gerado Automaticamente</strong></p>
                        <p>Sistema DiabetesCare - Para uso médico</p>
                    </div>
                    <div class="contato">
                        <p><strong>Desenvolvedor:</strong> Gledison Arruda Andrade</p>
                        <p><strong>Contato:</strong> saudetec@gmail.com</p>
                        <p><strong>Data:</strong> ${dataGeracao.toLocaleDateString('pt-BR', formatoData)}</p>
                    </div>
                </div>
            </div>
        `;
        
        return conteudo;
    }

    obterNomeTipoRelatorio(tipo) {
        const tipos = {
            'completo': 'Relatório Completo',
            'glicemia': 'Apenas Dados de Glicemia',
            'simples': 'Relatório Simples'
        };
        return tipos[tipo] || 'Relatório Personalizado';
    }

    getClassificacaoMedia(media) {
        if (media < 100) return 'excelente';
        if (media < 130) return 'bom';
        if (media < 150) return 'regular';
        return 'precisa-ajuste';
    }

    getClassificacaoTexto(media) {
        if (media < 100) return 'Excelente';
        if (media < 130) return 'Bom';
        if (media < 150) return 'Regular';
        return 'Precisa Ajuste';
    }

    getInterpretacaoMedia(media) {
        if (media < 100) return 'Controle glicêmico excelente, dentro dos parâmetros ideais para controle rigoroso.';
        if (media < 130) return 'Controle adequado para a maioria dos pacientes diabéticos. Mantenha o acompanhamento.';
        if (media < 150) return 'Controle regular. Considere ajustes na terapia e intensifique as medidas não farmacológicas.';
        return 'Controle abaixo do ideal. Necessita revisão do tratamento com profissional de saúde.';
    }

    getClassificacaoControle(percentual) {
        if (percentual >= 70) return 'excelente';
        if (percentual >= 50) return 'bom';
        return 'precisa-melhorar';
    }

    getClassificacaoControleTexto(percentual) {
        if (percentual >= 70) return 'Excelente';
        if (percentual >= 50) return 'Bom';
        return 'Precisa Melhorar';
    }

    getInterpretacaoControle(percentual) {
        if (percentual >= 70) return 'Excelente tempo no alvo glicêmico. Continue com o tratamento atual.';
        if (percentual >= 50) return 'Tempo no alvo satisfatório. Mantenha o monitoramento regular.';
        return 'Tempo no alvo abaixo do ideal. Otimização do tratamento pode ser necessária.';
    }

    getClassificacaoVariabilidade(variabilidade) {
        if (variabilidade < 20) return 'baixa';
        if (variabilidade < 40) return 'moderada';
        return 'alta';
    }

    getClassificacaoVariabilidadeTexto(variabilidade) {
        if (variabilidade < 20) return 'Baixa';
        if (variabilidade < 40) return 'Moderada';
        return 'Alta';
    }

    getInterpretacaoVariabilidade(variabilidade) {
        if (variabilidade < 20) return 'Excelente estabilidade glicêmica. Padrão muito consistente.';
        if (variabilidade < 40) return 'Estabilidade glicêmica aceitável. Continue monitorando.';
        return 'Alta variabilidade glicêmica. Pode indicar necessidade de ajuste no tratamento.';
    }

    obterStatusGlicemia(glicemia) {
        if (glicemia < 70) return 'Baixa';
        if (glicemia <= 180) return 'Normal';
        if (glicemia <= 250) return 'Alta';
        return 'Muito Alta';
    }

    obterClasseGlicemia(glicemia) {
        if (glicemia < 70) return 'baixa';
        if (glicemia <= 180) return 'normal';
        if (glicemia <= 250) return 'alta';
        return 'muito-alta';
    }

    gerarRecomendacoes(estatisticas, dados) {
        const recomendacoes = [];
        
        // Baseado na média
        if (estatisticas.media > 150) {
            recomendacoes.push('Considerar ajuste de medicação ou intensificar medidas não farmacológicas (dieta e exercícios).');
        } else if (estatisticas.media < 80) {
            recomendacoes.push('Atenção: média glicêmica baixa. Avaliar risco de hipoglicemia.');
        }
        
        // Baseado no tempo no alvo
        if (estatisticas.percentualNormais < 50) {
            recomendacoes.push('Aumentar frequência de monitoramento para melhor identificação de padrões glicêmicos.');
        }
        
        // Baseado nas hipoglicemias
        if (estatisticas.hipoglicemias > 0) {
            recomendacoes.push(`Foram registrados ${estatisticas.hipoglicemias} episódio(s) de hipoglicemia. Revisar doses de medicação e horários das refeições.`);
        }
        
        // Baseado nas hiperglicemias
        if (estatisticas.hiperglicemias > estatisticas.totalRegistros * 0.3) {
            recomendacoes.push('Frequência elevada de hiperglicemias. Avaliar necessidade de ajuste terapêutico.');
        }
        
        // Baseado na variabilidade
        if (estatisticas.variabilidade > 40) {
            recomendacoes.push('Alta variabilidade glicêmica detectada. Tentar manter horários regulares de refeições, medicação e atividade física.');
        }
        
        // Recomendações gerais
        recomendacoes.push('Continuar com acompanhamento regular com profissional de saúde.');
        recomendacoes.push('Manter registro diário no sistema para melhor acompanhamento.');
        recomendacoes.push('Retornar para reavaliação em 3 meses ou conforme orientação médica.');
        
        return `
            <ul>
                ${recomendacoes.map(rec => `<li><i class="fas fa-check-circle"></i> ${rec}</li>`).join('')}
            </ul>
        `;
    }

    exibirRelatorio(conteudo) {
        const container = document.getElementById('previa-relatorio');
        if (!container) {
            console.error('Container de prévia do relatório não encontrado');
            return;
        }
        
        container.innerHTML = conteudo;
        
        // Adicionar estilos CSS para o relatório
        this.adicionarEstilosRelatorio();
        
        // Renderizar gráfico
        setTimeout(() => {
            this.renderizarGraficoRelatorio();
        }, 100);
    }

    adicionarEstilosRelatorio() {
        // Verificar se os estilos já foram adicionados
        if (document.getElementById('estilos-relatorio')) {
            return;
        }
        
        const estilo = document.createElement('style');
        estilo.id = 'estilos-relatorio';
        estilo.textContent = `
            .relatorio-medico-profissional {
                font-family: 'Inter', Arial, sans-serif;
                background: white;
                color: #333;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                line-height: 1.6;
            }
            
            .cabecalho-relatorio {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding-bottom: 25px;
                border-bottom: 3px solid #4361ee;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }
            
            .logo-relatorio {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 15px;
            }
            
            .logo-relatorio i {
                font-size: 56px;
                color: #4361ee;
            }
            
            .logo-relatorio h1 {
                font-size: 28px;
                color: #4361ee;
                margin: 0 0 5px 0;
            }
            
            .logo-relatorio p {
                margin: 2px 0;
                color: #666;
            }
            
            .versao {
                font-size: 12px;
                color: #888;
                font-style: italic;
            }
            
            .info-relatorio {
                text-align: right;
                min-width: 300px;
            }
            
            .info-relatorio p {
                margin: 8px 0;
                color: #555;
            }
            
            .info-relatorio strong {
                color: #333;
            }
            
            .resumo-executivo {
                margin-bottom: 35px;
                padding: 20px;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border-radius: 12px;
            }
            
            .resumo-executivo h2 {
                color: #2c3e50;
                border-bottom: 2px solid #4361ee;
                padding-bottom: 12px;
                margin-bottom: 25px;
                font-size: 22px;
            }
            
            .estatisticas-destaque {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 25px;
            }
            
            .estatistica {
                background: white;
                border-radius: 12px;
                padding: 25px 20px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                transition: transform 0.3s ease;
            }
            
            .estatistica:hover {
                transform: translateY(-5px);
            }
            
            .estatistica .valor {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 12px;
                font-family: 'Inter', sans-serif;
            }
            
            .estatistica .valor.excelente { color: #2ecc71; }
            .estatistica .valor.bom { color: #3498db; }
            .estatistica .valor.regular { color: #f39c12; }
            .estatistica .valor.precisa-ajuste { color: #e74c3c; }
            .estatistica .valor.seguro { color: #2ecc71; }
            .estatistica .valor.perigo { color: #e74c3c; }
            
            .estatistica .label {
                font-size: 14px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                font-weight: 600;
            }
            
            .grafico-relatorio-secao {
                margin: 35px 0;
                padding: 25px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            
            .grafico-relatorio-secao h2 {
                color: #2c3e50;
                border-bottom: 2px solid #4361ee;
                padding-bottom: 12px;
                margin-bottom: 20px;
                font-size: 22px;
            }
            
            .grafico-relatorio-container {
                height: 350px;
                margin: 20px 0;
                position: relative;
            }
            
            .legenda-grafico {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            
            .legenda-item {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                color: #555;
            }
            
            .legenda-cor {
                width: 25px;
                height: 25px;
                border-radius: 5px;
            }
            
            .legenda-cor.baixa { background: #4cc9f0; }
            .legenda-cor.normal { background: #2ecc71; }
            .legenda-cor.alta { background: #ff9e00; }
            .legenda-cor.muito-alta { background: #e74c3c; }
            
            .analise-detalhada {
                margin: 35px 0;
                padding: 25px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            
            .analise-detalhada h2 {
                color: #2c3e50;
                border-bottom: 2px solid #4361ee;
                padding-bottom: 12px;
                margin-bottom: 25px;
                font-size: 22px;
            }
            
            .tabelas-analise {
                overflow-x: auto;
            }
            
            .tabela-analise {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                min-width: 800px;
            }
            
            .tabela-analise th {
                background: #4361ee;
                color: white;
                padding: 18px 20px;
                text-align: left;
                font-weight: 600;
                font-size: 15px;
            }
            
            .tabela-analise td {
                padding: 18px 20px;
                border-bottom: 1px solid #e0e0e0;
                color: #444;
            }
            
            .tabela-analise tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .tabela-analise tr:hover {
                background: #f1f7ff;
            }
            
            .badge {
                padding: 8px 16px;
                border-radius: 25px;
                font-size: 13px;
                font-weight: bold;
                display: inline-block;
                min-width: 100px;
                text-align: center;
            }
            
            .badge.excelente { background: #2ecc71; color: white; }
            .badge.bom { background: #3498db; color: white; }
            .badge.regular { background: #f39c12; color: white; }
            .badge.precisa-ajuste { background: #e74c3c; color: white; }
            .badge.baixa { background: #2ecc71; color: white; }
            .badge.moderada { background: #f39c12; color: white; }
            .badge.alta { background: #e74c3c; color: white; }
            
            .status {
                padding: 8px 16px;
                border-radius: 25px;
                font-size: 13px;
                font-weight: bold;
                color: white;
                display: inline-block;
                min-width: 100px;
                text-align: center;
            }
            
            .status.baixa { background: #4cc9f0; }
            .status.normal { background: #2ecc71; }
            .status.alta { background: #ff9e00; }
            .status.muito-alta { background: #e74c3c; }
            
            .registros-relatorio {
                margin: 35px 0;
                padding: 25px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            
            .registros-relatorio h2 {
                color: #2c3e50;
                border-bottom: 2px solid #4361ee;
                padding-bottom: 12px;
                margin-bottom: 25px;
                font-size: 22px;
            }
            
            .tabela-registros-container {
                overflow-x: auto;
                border-radius: 10px;
                border: 1px solid #e0e0e0;
            }
            
            .tabela-registros {
                width: 100%;
                border-collapse: collapse;
                min-width: 800px;
            }
            
            .tabela-registros th {
                background: #f8f9fa;
                color: #2c3e50;
                padding: 16px 20px;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid #4361ee;
            }
            
            .tabela-registros td {
                padding: 14px 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .tabela-registros tr:hover {
                background: #f5f9ff;
            }
            
            .resumo-registros {
                background: #f8f9fa !important;
                color: #666;
            }
            
            .recomendacoes {
                margin: 35px 0;
                padding: 25px;
                background: linear-gradient(135deg, #fff8e1, #fff3cd);
                border-radius: 12px;
                border-left: 6px solid #f39c12;
            }
            
            .recomendacoes h2 {
                color: #2c3e50;
                padding-bottom: 12px;
                margin-bottom: 25px;
                font-size: 22px;
            }
            
            .lista-recomendacoes ul {
                list-style: none;
                padding: 0;
            }
            
            .lista-recomendacoes li {
                padding: 18px;
                margin-bottom: 15px;
                background: white;
                border-radius: 10px;
                display: flex;
                align-items: flex-start;
                gap: 15px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.05);
                border-left: 4px solid #2ecc71;
            }
            
            .lista-recomendacoes li i {
                color: #2ecc71;
                margin-top: 3px;
                font-size: 18px;
            }
            
            .rodape-relatorio {
                margin-top: 50px;
                padding-top: 30px;
                border-top: 2px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                flex-wrap: wrap;
            }
            
            .assinatura {
                text-align: center;
                min-width: 300px;
            }
            
            .assinatura p {
                margin: 8px 0;
                color: #666;
            }
            
            .contato {
                text-align: right;
                min-width: 300px;
            }
            
            .contato p {
                margin: 5px 0;
                color: #666;
                font-size: 14px;
            }
            
            .instrucao-relatorio {
                padding: 40px;
                text-align: center;
            }
            
            .instrucao-conteudo {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .instrucao-conteudo i {
                font-size: 64px;
                color: #4361ee;
                margin-bottom: 20px;
            }
            
            .instrucao-conteudo h3 {
                color: #2c3e50;
                margin-bottom: 15px;
            }
            
            .instrucao-passos {
                margin: 30px 0;
                text-align: left;
            }
            
            .passo {
                display: flex;
                align-items: flex-start;
                gap: 20px;
                margin-bottom: 25px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #4361ee;
            }
            
            .passo-numero {
                background: #4361ee;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .instrucao-dicas {
                margin-top: 30px;
                padding: 20px;
                background: #e8f4ff;
                border-radius: 10px;
                border-left: 4px solid #3498db;
            }
            
            @media (max-width: 768px) {
                .cabecalho-relatorio {
                    flex-direction: column;
                }
                
                .info-relatorio {
                    text-align: left;
                    margin-top: 20px;
                }
                
                .estatisticas-destaque {
                    grid-template-columns: 1fr;
                }
                
                .rodape-relatorio {
                    flex-direction: column;
                    gap: 30px;
                }
                
                .assinatura, .contato {
                    text-align: center;
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(estilo);
    }

    renderizarGraficoRelatorio() {
        const canvas = document.getElementById('grafico-relatorio-canvas');
        if (!canvas || !this.relatorioAtual) return;
        
        const dados = this.relatorioAtual.dados;
        if (!dados || dados.length === 0) {
            canvas.parentElement.innerHTML = `
                <div class="sem-dados-grafico">
                    <i class="fas fa-chart-line"></i>
                    <p>Não há dados suficientes para gerar gráfico</p>
                </div>
            `;
            return;
        }
        
        const dadosOrdenados = dados.sort((a, b) => a.timestamp - b.timestamp);
        const labels = dadosOrdenados.map(g => {
            const data = new Date(g.data);
            return `${data.getDate()}/${data.getMonth() + 1} ${g.hora.substring(0, 5)}`;
        });
        const valores = dadosOrdenados.map(g => g.glicemia);
        
        // Cores dos pontos baseadas nos valores
        const coresPontos = valores.map(v => {
            if (v < 70) return '#4cc9f0';    // Azul - Baixa
            if (v <= 180) return '#2ecc71';  // Verde - Normal
            if (v <= 250) return '#ff9e00';  // Laranja - Alta
            return '#e74c3c';               // Vermelho - Muito Alta
        });
        
        const ctx = canvas.getContext('2d');
        
        // Limpar gráfico anterior se existir
        if (this.graficoRelatorio) {
            this.graficoRelatorio.destroy();
        }
        
        this.graficoRelatorio = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Glicemia (mg/dL)',
                    data: valores,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: coresPontos,
                    pointBorderColor: '#ffffff',
                    pointRadius: 5,
                    pointHoverRadius: 7,
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
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        padding: 15,
                        cornerRadius: 10,
                        titleFont: {
                            family: "'Inter', sans-serif",
                            size: 14
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif",
                            size: 13
                        },
                        callbacks: {
                            label: (context) => {
                                const valor = context.parsed.y;
                                const status = this.obterStatusGlicemia(valor);
                                return `Glicemia: ${valor} mg/dL (${status})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 50,
                        suggestedMax: Math.max(...valores) + 20,
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
                            },
                            maxRotation: 45
                        },
                        title: {
                            display: true,
                            text: 'Data / Hora',
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

    mostrarLoading(mostrar) {
        const container = document.getElementById('previa-relatorio');
        if (!container) return;
        
        if (mostrar) {
            container.innerHTML = `
                <div class="loading-relatorio">
                    <div class="loading-conteudo">
                        <i class="fas fa-spinner fa-spin fa-3x"></i>
                        <h3>Gerando Relatório...</h3>
                        <p>Analisando dados e criando visualizações</p>
                        <div class="loading-bar">
                            <div class="loading-progress"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Animar a barra de progresso
            setTimeout(() => {
                const progressBar = container.querySelector('.loading-progress');
                if (progressBar) {
                    progressBar.style.width = '100%';
                }
            }, 100);
        }
    }

    mostrarNotificacao(mensagem, tipo) {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.innerHTML = `
            <div class="notificacao-conteudo">
                <i class="fas fa-${tipo === 'sucesso' ? 'check-circle' : tipo === 'erro' ? 'exclamation-circle' : 'info-circle'}"></i>
                <div>
                    <strong>${tipo === 'sucesso' ? 'Sucesso!' : tipo === 'erro' ? 'Erro!' : 'Informação'}</strong>
                    <p>${mensagem}</p>
                </div>
            </div>
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

    async baixarPDF() {
        if (!this.relatorioAtual) {
            this.mostrarNotificacao('Gere um relatório primeiro', 'erro');
            return;
        }

        try {
            this.mostrarLoading(true);
            
            // Verificar se jsPDF está disponível
            if (typeof window.jspdf === 'undefined') {
                throw new Error('Biblioteca PDF não carregada');
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            let yPos = 20;

            // Cabeçalho
            doc.setFontSize(22);
            doc.setTextColor(67, 97, 238);
            doc.setFont('helvetica', 'bold');
            doc.text('RELATÓRIO MÉDICO - DIABETESCARE', pageWidth / 2, yPos, { align: 'center' });
            
            yPos += 10;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.text(`Período: ${this.relatorioAtual.inicio} a ${this.relatorioAtual.fim}`, 20, yPos);
            
            yPos += 8;
            doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPos);
            
            yPos += 15;

            // Resumo Executivo
            const { estatisticas } = this.relatorioAtual;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMO EXECUTIVO', 20, yPos);
            
            yPos += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            
            const estatisticasTexto = [
                `• Média Glicêmica: ${estatisticas.media} mg/dL`,
                `• Glicemia Mínima: ${estatisticas.minima} mg/dL`,
                `• Glicemia Máxima: ${estatisticas.maxima} mg/dL`,
                `• Tempo no Alvo: ${estatisticas.percentualNormais}%`,
                `• Hipoglicemias: ${estatisticas.hipoglicemias}`,
                `• Hiperglicemias: ${estatisticas.hiperglicemias}`,
                `• Variabilidade: ${estatisticas.variabilidade}`,
                `• Total de Registros: ${estatisticas.totalRegistros}`
            ];
            
            estatisticasTexto.forEach(texto => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(texto, 20, yPos);
                yPos += 7;
            });
            
            yPos += 10;

            // Recomendações
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RECOMENDAÇÕES MÉDICAS', 20, yPos);
            
            yPos += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            
            const recomendacoesTexto = this.extrairRecomendacoesTexto();
            const linhasRecomendacoes = doc.splitTextToSize(recomendacoesTexto, pageWidth - 40);
            
            linhasRecomendacoes.forEach(linha => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(linha, 20, yPos);
                yPos += 7;
            });

            // Rodapé
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Documento gerado automaticamente pelo Sistema DiabetesCare', pageWidth / 2, 280, { align: 'center' });
            doc.text('Para uso médico e de acompanhamento do paciente', pageWidth / 2, 285, { align: 'center' });
            
            // Salvar PDF
            const nomeArquivo = `Relatorio_DiabetesCare_${this.relatorioAtual.inicio.replace(/-/g, '')}_${this.relatorioAtual.fim.replace(/-/g, '')}.pdf`;
            doc.save(nomeArquivo);

            this.mostrarNotificacao('PDF baixado com sucesso!', 'sucesso');

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            
            // Fallback: tentar usar método alternativo
            if (error.message.includes('Biblioteca PDF')) {
                this.mostrarNotificacao('Biblioteca PDF não disponível. Use o relatório online ou recarregue a página.', 'erro');
                
                // Oferecer alternativa
                const container = document.getElementById('previa-relatorio');
                if (container) {
                    const alternativa = document.createElement('div');
                    alternativa.className = 'alternativa-pdf';
                    alternativa.innerHTML = `
                        <div class="alternativa-conteudo">
                            <i class="fas fa-file-pdf"></i>
                            <h3>PDF Não Disponível</h3>
                            <p>A biblioteca para geração de PDFs não está carregada.</p>
                            <p><strong>Alternativas:</strong></p>
                            <ul>
                                <li>1. Recarregue a página e tente novamente</li>
                                <li>2. Use a função de impressão do navegador (Ctrl+P)</li>
                                <li>3. Salve o relatório como HTML</li>
                            </ul>
                            <button id="imprimir-relatorio" class="btn btn-primary">
                                <i class="fas fa-print"></i> Imprimir Relatório
                            </button>
                        </div>
                    `;
                    container.appendChild(alternativa);
                    
                    document.getElementById('imprimir-relatorio').addEventListener('click', () => {
                        window.print();
                    });
                }
            } else {
                this.mostrarNotificacao('Erro ao baixar PDF: ' + error.message, 'erro');
            }
        } finally {
            this.mostrarLoading(false);
        }
    }

    extrairRecomendacoesTexto() {
        if (!this.relatorioAtual) return '';
        
        const { estatisticas } = this.relatorioAtual;
        const recomendacoes = [];
        
        if (estatisticas.media > 150) {
            recomendacoes.push('Considerar ajuste de medicação ou intensificar medidas não farmacológicas.');
        }
        
        if (estatisticas.percentualNormais < 50) {
            recomendacoes.push('Aumentar frequência de monitoramento para identificar padrões.');
        }
        
        if (estatisticas.hipoglicemias > 0) {
            recomendacoes.push(`Foram registrados ${estatisticas.hipoglicemias} episódio(s) de hipoglicemia. Revisar doses de medicação.`);
        }
        
        if (estatisticas.variabilidade > 40) {
            recomendacoes.push('Tentar manter horários regulares de refeições e medicação.');
        }
        
        recomendacoes.push('Continuar com acompanhamento regular.');
        recomendacoes.push('Manter registro diário no sistema.');
        recomendacoes.push('Retornar para reavaliação em 3 meses ou conforme orientação médica.');
        
        return recomendacoes.join(' ');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.relatoriosSistema = new RelatoriosSistema();
    
    // Inicializar quando a seção de relatórios for ativada
    document.addEventListener('secaoAtivada', (e) => {
        if (e.detail.secaoId === 'relatorio') {
            setTimeout(() => {
                if (window.relatoriosSistema && typeof window.relatoriosSistema.inicializar === 'function') {
                    window.relatoriosSistema.inicializar();
                }
            }, 300);
        }
    });
    
    // Inicializar agora se a seção de relatórios já estiver ativa
    if (document.getElementById('relatorio')?.classList.contains('ativa')) {
        setTimeout(() => {
            if (window.relatoriosSistema && typeof window.relatoriosSistema.inicializar === 'function') {
                window.relatoriosSistema.inicializar();
            }
        }, 500);
    }
    
    console.log('Sistema de relatórios carregado e pronto para uso');
});