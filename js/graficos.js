// Gráficos e Visualizações - Substituindo Plotly por Chart.js
class GerenciadorGraficos {
    constructor() {
        this.graficos = {};
        this.cores = {
            faseR: 'rgba(220, 53, 69, 0.8)',
            faseS: 'rgba(40, 167, 69, 0.8)',
            faseT: 'rgba(23, 162, 184, 0.8)',
            potencia: 'rgba(108, 117, 125, 0.8)',
            demanda: 'rgba(255, 193, 7, 0.8)',
            corrente: 'rgba(0, 123, 255, 0.8)',
            queda: 'rgba(111, 66, 193, 0.8)',
            recomendado: 'rgba(40, 167, 69, 1)'
        };
    }

    // Inicializar todos os gráficos
    inicializarGraficos() {
        this.criarGraficoPotenciaDemanda();
        this.criarGraficoCorrente();
        this.criarGraficoQuedaTensao();
        this.criarGraficoSubestacao();
    }

    // Atualizar todos os gráficos com novos dados
    atualizarGraficos(dadosQuadros) {
        if (!dadosQuadros || dadosQuadros.length === 0) {
            this.limparGraficos();
            return;
        }

        const analise = analisarSistema(dadosQuadros);
        
        this.atualizarGraficoPotenciaDemanda(analise);
        this.atualizarGraficoCorrente(analise);
        this.atualizarGraficoQuedaTensao(dadosQuadros);
        this.atualizarGraficoSubestacao(analise, dadosQuadros);
    }

    // Gráfico de Potência vs Demanda por Fase
    criarGraficoPotenciaDemanda() {
        const ctx = document.getElementById('powerChart').getContext('2d');
        
        this.graficos.potenciaDemanda = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Fase R', 'Fase S', 'Fase T'],
                datasets: [
                    {
                        label: 'Potência (kW)',
                        data: [0, 0, 0],
                        backgroundColor: this.cores.potencia,
                        borderColor: this.cores.potencia.replace('0.8', '1'),
                        borderWidth: 1
                    },
                    {
                        label: 'Demanda (kVA)',
                        data: [0, 0, 0],
                        backgroundColor: this.cores.demanda,
                        borderColor: this.cores.demanda.replace('0.8', '1'),
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparação entre Potência Instalada e Demanda por Fase',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString('pt-BR')} ${context.dataset.label.includes('Potência') ? 'kW' : 'kVA'}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor (kW ou kVA)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('pt-BR');
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Fase'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // Gráfico de Corrente por Fase
    criarGraficoCorrente() {
        const ctx = document.getElementById('currentChart').getContext('2d');
        
        this.graficos.corrente = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Fase R', 'Fase S', 'Fase T'],
                datasets: [{
                    label: 'Corrente (A)',
                    data: [0, 0, 0],
                    backgroundColor: [
                        this.cores.faseR,
                        this.cores.faseS,
                        this.cores.faseT
                    ],
                    borderColor: [
                        this.cores.faseR.replace('0.8', '1'),
                        this.cores.faseS.replace('0.8', '1'),
                        this.cores.faseT.replace('0.8', '1')
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Corrente Total por Fase',
                        font: { size: 14 }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Corrente: ${context.parsed.y.toLocaleString('pt-BR', {maximumFractionDigits: 2})} A`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Corrente (A)'
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Queda de Tensão por Circuito
    criarGraficoQuedaTensao() {
        const ctx = document.getElementById('voltageDropChart').getContext('2d');
        
        this.graficos.quedaTensao = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Queda de Tensão (%)',
                    data: [],
                    backgroundColor: this.cores.queda,
                    borderColor: this.cores.queda.replace('0.8', '1'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Queda de Tensão por Circuito',
                        font: { size: 14 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Queda: ${context.parsed.y.toLocaleString('pt-BR', {maximumFractionDigits: 2})}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Queda de Tensão (%)'
                        },
                        max: 5 // Limite para melhor visualização
                    }
                }
            }
        });
    }

    // Gráfico de Dimensionamento da Subestação
    criarGraficoSubestacao() {
        const ctx = document.getElementById('substationChart').getContext('2d');
        
        this.graficos.subestacao = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Capacidades Disponíveis (kVA)',
                        data: [],
                        backgroundColor: this.cores.potencia,
                        borderColor: this.cores.potencia.replace('0.8', '1'),
                        borderWidth: 1
                    },
                    {
                        label: 'Demanda Calculada (kVA)',
                        data: [],
                        backgroundColor: this.cores.demanda,
                        borderColor: this.cores.demanda.replace('0.8', '1'),
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Demanda Calculada vs Capacidades de Subestação',
                        font: { size: 14 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.x.toLocaleString('pt-BR')} kVA`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {}
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Capacidade (kVA)'
                        }
                    }
                }
            }
        });
    }

    // Atualizar gráfico de Potência vs Demanda
    atualizarGraficoPotenciaDemanda(analise) {
        if (!analise) return;

        const potencias = [
            analise.fases.R.potencia / 1000,
            analise.fases.S.potencia / 1000,
            analise.fases.T.potencia / 1000
        ];

        const demandas = [
            analise.fases.R.demanda / 1000,
            analise.fases.S.demanda / 1000,
            analise.fases.T.demanda / 1000
        ];

        this.graficos.potenciaDemanda.data.datasets[0].data = potencias;
        this.graficos.potenciaDemanda.data.datasets[1].data = demandas;
        this.graficos.potenciaDemanda.update();
    }

    // Atualizar gráfico de Corrente
    atualizarGraficoCorrente(analise) {
        if (!analise) return;

        const correntes = [
            analise.fases.R.corrente,
            analise.fases.S.corrente,
            analise.fases.T.corrente
        ];

        this.graficos.corrente.data.datasets[0].data = correntes;
        this.graficos.corrente.update();
    }

    // Atualizar gráfico de Queda de Tensão
    atualizarGraficoQuedaTensao(dadosQuadros) {
        const circuitos = dadosQuadros.map(q => q.DESCRIÇÃO);
        const quedas = dadosQuadros.map(q => q['QUEDA DE TENSÃO (%)']);

        // Limitar a 15 circuitos para melhor visualização
        const circuitosExibir = circuitos.slice(0, 15);
        const quedasExibir = quedas.slice(0, 15);

        this.graficos.quedaTensao.data.labels = circuitosExibir;
        this.graficos.quedaTensao.data.datasets[0].data = quedasExibir;
        
        // Ajustar altura do gráfico baseado no número de circuitos
        const alturaBase = 250;
        const alturaAdicional = circuitosExibir.length * 20;
        this.graficos.quedaTensao.canvas.parentNode.style.height = `${Math.max(alturaBase, alturaAdicional)}px`;
        
        this.graficos.quedaTensao.update();
    }

    // Atualizar gráfico de Subestação
    atualizarGraficoSubestacao(analise, dadosQuadros) {
        if (!analise) return;

        const subestacoes = [75, 112.5, 225, 300, 500, 750, 1000, 1250, 1500, 1750, 2000];
        const demandaKVA = analise.demandaKVA;

        // Filtrar subestações relevantes (até 2x a demanda)
        const subestacoesRelevantes = subestacoes.filter(s => s <= demandaKVA * 2 || s === analise.subestacaoRecomendada);
        
        // Adicionar a demanda calculada como um ponto especial
        const labels = [...subestacoesRelevantes.map(s => `${s} kVA`), 'Sua Demanda'];
        const valoresSubestacoes = [...subestacoesRelevantes, null];
        const valoresDemanda = [null, null, null, null, null, null, null, null, null, null, null, demandaKVA];

        this.graficos.subestacao.data.labels = labels;
        this.graficos.subestacao.data.datasets[0].data = valoresSubestacoes;
        this.graficos.subestacao.data.datasets[1].data = valoresDemanda;

        // Adicionar linha de recomendação (simulação de annotation)
        this.graficos.subestacao.options.plugins.annotation.annotations = {
            linhaRecomendacao: {
                type: 'line',
                xMin: analise.subestacaoRecomendada,
                xMax: analise.subestacaoRecomendada,
                borderColor: this.cores.recomendado,
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    content: `Recomendado: ${analise.subestacaoRecomendada} kVA`,
                    enabled: true,
                    position: 'end'
                }
            }
        };

        this.graficos.subestacao.update();
    }

    // Limpar todos os gráficos
    limparGraficos() {
        Object.values(this.graficos).forEach(grafico => {
            if (grafico.data.datasets) {
                grafico.data.datasets.forEach(dataset => {
                    dataset.data = [];
                });
                grafico.data.labels = [];
                grafico.update();
            }
        });
    }

    // Criar gráfico de pizza para distribuição de cargas
    criarGraficoDistribuicao(dadosQuadros, elementoId) {
        const ctx = document.getElementById(elementoId).getContext('2d');
        
        // Agrupar por tipo de circuito
        const tipos = {
            'Trifásico': 0,
            'Bifásico': 0,
            'Monofásico': 0
        };

        dadosQuadros.forEach(quadro => {
            const fasesAtivas = [quadro['ATIVA-R'], quadro['ATIVA-S'], quadro['ATIVA-T']].filter(p => p > 0).length;
            
            if (fasesAtivas === 3) tipos['Trifásico'] += quadro['POT. TOTAL (W)'];
            else if (fasesAtivas === 2) tipos['Bifásico'] += quadro['POT. TOTAL (W)'];
            else tipos['Monofásico'] += quadro['POT. TOTAL (W)'];
        });

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(tipos),
                datasets: [{
                    data: Object.values(tipos),
                    backgroundColor: [
                        this.cores.faseR,
                        this.cores.faseS,
                        this.cores.faseT
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição por Tipo de Circuito'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${(value/1000).toLocaleString('pt-BR')} kW (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de evolução temporal (se houver dados de data)
    criarGraficoEvolucao(dadosQuadros, elementoId) {
        const ctx = document.getElementById(elementoId).getContext('2d');
        
        // Simular dados temporais se não existirem
        const dadosComData = dadosQuadros.map((quadro, index) => ({
            ...quadro,
            data: new Date(Date.now() - (dadosQuadros.length - index - 1) * 86400000) // Dias anteriores
        }));

        const labels = dadosComData.map(d => 
            d.data.toLocaleDateString('pt-BR')
        );

        const potencias = dadosComData.map(d => d['POT. TOTAL (W)'] / 1000);
        const demandas = dadosComData.map(d => d['DEM. TOTAL (VA)'] / 1000);

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Potência (kW)',
                        data: potencias,
                        borderColor: this.cores.potencia,
                        backgroundColor: this.cores.potencia.replace('0.8', '0.1'),
                        tension: 0.4
                    },
                    {
                        label: 'Demanda (kVA)',
                        data: demandas,
                        borderColor: this.cores.demanda,
                        backgroundColor: this.cores.demanda.replace('0.8', '0.1'),
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução das Cargas ao Longo do Tempo'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'kW / kVA'
                        }
                    }
                }
            }
        });
    }

    // Exportar gráficos como imagem
    exportarGraficoComoImagem(nomeGrafico, formato = 'png') {
        const grafico = this.graficos[nomeGrafico];
        if (!grafico) {
            console.error('Gráfico não encontrado:', nomeGrafico);
            return;
        }

        const link = document.createElement('a');
        link.download = `grafico_${nomeGrafico}.${formato}`;
        link.href = grafico.toBase64Image();
        link.click();
    }

    // Exportar todos os gráficos como ZIP
    exportarTodosGraficos() {
        // Esta função requer uma biblioteca adicional para ZIP
        console.log('Funcionalidade de exportação ZIP requer biblioteca adicional');
    }
}

// Função global para atualizar gráficos
function atualizarGraficos(dadosQuadros) {
    if (!window.gerenciadorGraficos) {
        window.gerenciadorGraficos = new GerenciadorGraficos();
        window.gerenciadorGraficos.inicializarGraficos();
    }
    
    window.gerenciadorGraficos.atualizarGraficos(dadosQuadros);
}

// Inicializar gráficos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno delay para garantir que o DOM esteja totalmente carregado
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            window.gerenciadorGraficos = new GerenciadorGraficos();
            window.gerenciadorGraficos.inicializarGraficos();
        }
    }, 100);
});