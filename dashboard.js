// Dashboard JavaScript - Sistema de Satisfação da Cantina

let dadosAvaliacoes = [];
let charts = {};

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    configurarModal();
    configurarEventos();
});

function carregarDados() {
    // Tentar carregar do localStorage primeiro (para demonstração)
    const dadosLocal = localStorage.getItem('cantina_evaluations');
    
    if (dadosLocal) {
        dadosAvaliacoes = JSON.parse(dadosLocal);
        atualizarDashboard();
    } else {
        // Se não há dados locais, tentar carregar do servidor
        fetch('receber_questionario.php?action=stats')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log('Nenhum dado no servidor, usando dados de exemplo');
                    gerarDadosExemplo();
                } else {
                    dadosAvaliacoes = data;
                    atualizarDashboard();
                }
            })
            .catch(error => {
                console.log('Erro ao carregar dados do servidor, usando dados de exemplo');
                gerarDadosExemplo();
            });
    }
}

function gerarDadosExemplo() {
    // Gerar dados de exemplo para demonstração
    const turmas = ['1ano', '2ano', '3ano', 'professor', 'funcionario'];
    const frequencias = ['diariamente', 'algumas-vezes-semana', 'raramente'];
    const recomendacoes = ['sim', 'nao', 'talvez'];
    
    dadosAvaliacoes = [];
    
    for (let i = 0; i < 50; i++) {
        const sabor = Math.floor(Math.random() * 5) + 1;
        const qualidade = Math.floor(Math.random() * 5) + 1;
        const variedade = Math.floor(Math.random() * 5) + 1;
        const atendimento = Math.floor(Math.random() * 5) + 1;
        const tempo = Math.floor(Math.random() * 5) + 1;
        const limpeza = Math.floor(Math.random() * 5) + 1;
        const espaco = Math.floor(Math.random() * 5) + 1;
        const precos = Math.floor(Math.random() * 5) + 1;
        const satisfacao = Math.floor(Math.random() * 5) + 1;
        
        const score = ((sabor + qualidade + variedade + atendimento + tempo + limpeza + espaco + precos + satisfacao) / 9).toFixed(2);
        
        const avaliacao = {
            id: 'eval_' + Date.now() + '_' + i,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            turma: turmas[Math.floor(Math.random() * turmas.length)],
            frequencia: frequencias[Math.floor(Math.random() * frequencias.length)],
            sabor: sabor,
            qualidade: qualidade,
            variedade: variedade,
            atendimento: atendimento,
            tempo: tempo,
            limpeza: limpeza,
            espaco: espaco,
            precos: precos,
            satisfacao: satisfacao,
            recomendacao: recomendacoes[Math.floor(Math.random() * recomendacoes.length)],
            score: parseFloat(score),
            classificacao: classificarSatisfacao(parseFloat(score)),
            sugestoes: i % 3 === 0 ? 'Sugiro melhorar a variedade do cardápio' : '',
            comentarios: i % 4 === 0 ? 'Gosto muito da cantina, mas poderia melhorar' : '',
            anonimo: 'on'
        };
        
        dadosAvaliacoes.push(avaliacao);
    }
    
    atualizarDashboard();
}

function classificarSatisfacao(score) {
    if (score >= 4.5) return "Muito Satisfeito";
    if (score >= 3.5) return "Satisfeito";
    if (score >= 2.5) return "Neutro";
    if (score >= 1.5) return "Insatisfeito";
    return "Muito Insatisfeito";
}

function atualizarDashboard() {
    atualizarEstatisticas();
    criarGraficos();
    atualizarTabelaAvaliacoes();
    atualizarListaComentarios();
}

function atualizarEstatisticas() {
    const total = dadosAvaliacoes.length;
    const scoreMedio = total > 0 ? (dadosAvaliacoes.reduce((sum, item) => sum + item.score, 0) / total).toFixed(1) : 0;
    
    // Calcular satisfação geral predominante
    const classificacoes = dadosAvaliacoes.map(item => item.classificacao);
    const satisfacaoGeral = classificacoes.length > 0 ? 
        classificacoes.sort((a, b) => 
            classificacoes.filter(v => v === a).length - classificacoes.filter(v => v === b).length
        ).pop() : '-';
    
    // Calcular percentual de recomendações
    const recomendacoesSim = dadosAvaliacoes.filter(item => item.recomendacao === 'sim').length;
    const percentualRecomendacoes = total > 0 ? Math.round((recomendacoesSim / total) * 100) : 0;
    
    document.getElementById('total-respostas').textContent = total;
    document.getElementById('score-medio').textContent = scoreMedio;
    document.getElementById('satisfacao-geral').textContent = satisfacaoGeral;
    document.getElementById('recomendacoes').textContent = percentualRecomendacoes + '%';
}

function criarGraficos() {
    criarGraficoSatisfacao();
    criarGraficoCategorias();
    criarGraficoFrequencia();
    criarGraficoTemporal();
}

function criarGraficoSatisfacao() {
    const ctx = document.getElementById('chart-satisfacao').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (charts.satisfacao) {
        charts.satisfacao.destroy();
    }
    
    const classificacoes = {};
    dadosAvaliacoes.forEach(item => {
        classificacoes[item.classificacao] = (classificacoes[item.classificacao] || 0) + 1;
    });
    
    charts.satisfacao = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(classificacoes),
            datasets: [{
                data: Object.values(classificacoes),
                backgroundColor: [
                    '#2ecc71', // Muito Satisfeito
                    '#3498db', // Satisfeito
                    '#f39c12', // Neutro
                    '#e74c3c', // Insatisfeito
                    '#c0392b'  // Muito Insatisfeito
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function criarGraficoCategorias() {
    const ctx = document.getElementById('chart-categorias').getContext('2d');
    
    if (charts.categorias) {
        charts.categorias.destroy();
    }
    
    const categorias = ['sabor', 'qualidade', 'variedade', 'atendimento', 'tempo', 'limpeza', 'espaco', 'precos'];
    const medias = categorias.map(cat => {
        const valores = dadosAvaliacoes.map(item => item[cat]).filter(v => v);
        return valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1) : 0;
    });
    
    charts.categorias = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categorias.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            datasets: [{
                label: 'Média por Categoria',
                data: medias,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 2,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function criarGraficoFrequencia() {
    const ctx = document.getElementById('chart-frequencia').getContext('2d');
    
    if (charts.frequencia) {
        charts.frequencia.destroy();
    }
    
    const frequencias = {};
    dadosAvaliacoes.forEach(item => {
        frequencias[item.frequencia] = (frequencias[item.frequencia] || 0) + 1;
    });
    
    charts.frequencia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(frequencias),
            datasets: [{
                label: 'Número de Usuários',
                data: Object.values(frequencias),
                backgroundColor: '#667eea',
                borderColor: '#5a6fd8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function criarGraficoTemporal() {
    const ctx = document.getElementById('chart-temporal').getContext('2d');
    
    if (charts.temporal) {
        charts.temporal.destroy();
    }
    
    // Agrupar por data
    const dadosPorData = {};
    dadosAvaliacoes.forEach(item => {
        const data = new Date(item.timestamp).toLocaleDateString('pt-BR');
        if (!dadosPorData[data]) {
            dadosPorData[data] = { count: 0, scoreSum: 0 };
        }
        dadosPorData[data].count++;
        dadosPorData[data].scoreSum += item.score;
    });
    
    const datas = Object.keys(dadosPorData).sort();
    const medias = datas.map(data => (dadosPorData[data].scoreSum / dadosPorData[data].count).toFixed(1));
    
    charts.temporal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datas.slice(-7), // Últimos 7 dias
            datasets: [{
                label: 'Score Médio Diário',
                data: medias.slice(-7),
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderColor: '#667eea',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}

function atualizarTabelaAvaliacoes() {
    const tbody = document.getElementById('tbody-avaliacoes');
    const ultimasAvaliacoes = dadosAvaliacoes
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    
    tbody.innerHTML = ultimasAvaliacoes.map(item => `
        <tr>
            <td>${new Date(item.timestamp).toLocaleDateString('pt-BR')}</td>
            <td>${item.turma}</td>
            <td>${item.score}</td>
            <td><span class="classificacao ${item.classificacao.toLowerCase().replace(/\s+/g, '-')}">${item.classificacao}</span></td>
            <td>${item.recomendacao === 'sim' ? '✅' : item.recomendacao === 'nao' ? '❌' : '🤔'}</td>
            <td><button class="btn-ver-detalhes" onclick="verDetalhes('${item.id}')">Ver Detalhes</button></td>
        </tr>
    `).join('');
}

function atualizarListaComentarios() {
    const lista = document.getElementById('lista-comentarios');
    const comentarios = dadosAvaliacoes
        .filter(item => item.sugestoes || item.comentarios)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
    
    if (comentarios.length === 0) {
        lista.innerHTML = '<div class="loading">Nenhum comentário encontrado</div>';
        return;
    }
    
    lista.innerHTML = comentarios.map(item => `
        <div class="comment-item">
            <div class="comment-header">
                <span>${new Date(item.timestamp).toLocaleDateString('pt-BR')}</span>
                <span class="classificacao ${item.classificacao.toLowerCase().replace(/\s+/g, '-')}">${item.classificacao}</span>
            </div>
            <div class="comment-text">
                ${item.sugestoes ? `<strong>Sugestão:</strong> ${item.sugestoes}<br>` : ''}
                ${item.comentarios ? `<strong>Comentário:</strong> ${item.comentarios}` : ''}
            </div>
        </div>
    `).join('');
}

function verDetalhes(id) {
    const avaliacao = dadosAvaliacoes.find(item => item.id === id);
    if (!avaliacao) return;
    
    const modal = document.getElementById('modal-detalhes');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <h4>Informações Gerais</h4>
            <p><strong>Data:</strong> ${new Date(avaliacao.timestamp).toLocaleString('pt-BR')}</p>
            <p><strong>Turma:</strong> ${avaliacao.turma}</p>
            <p><strong>Frequência:</strong> ${avaliacao.frequencia}</p>
            <p><strong>Score Geral:</strong> ${avaliacao.score}</p>
            <p><strong>Classificação:</strong> ${avaliacao.classificacao}</p>
        </div>
        
        <div class="detail-section">
            <h4>Avaliações Detalhadas</h4>
            <p><strong>Sabor:</strong> ${avaliacao.sabor}/5</p>
            <p><strong>Qualidade:</strong> ${avaliacao.qualidade}/5</p>
            <p><strong>Variedade:</strong> ${avaliacao.variedade}/5</p>
            <p><strong>Atendimento:</strong> ${avaliacao.atendimento}/5</p>
            <p><strong>Tempo de Espera:</strong> ${avaliacao.tempo}/5</p>
            <p><strong>Limpeza:</strong> ${avaliacao.limpeza}/5</p>
            <p><strong>Espaço:</strong> ${avaliacao.espaco}/5</p>
            <p><strong>Preços:</strong> ${avaliacao.precos}/5</p>
            <p><strong>Satisfação Geral:</strong> ${avaliacao.satisfacao}/5</p>
        </div>
        
        ${avaliacao.sugestoes || avaliacao.comentarios ? `
        <div class="detail-section">
            <h4>Comentários e Sugestões</h4>
            ${avaliacao.sugestoes ? `<p><strong>Sugestões:</strong> ${avaliacao.sugestoes}</p>` : ''}
            ${avaliacao.comentarios ? `<p><strong>Comentários:</strong> ${avaliacao.comentarios}</p>` : ''}
        </div>
        ` : ''}
        
        <div class="detail-section">
            <h4>Recomendação</h4>
            <p>${avaliacao.recomendacao === 'sim' ? '✅ Recomenda a cantina' : 
                 avaliacao.recomendacao === 'nao' ? '❌ Não recomenda a cantina' : 
                 '🤔 Talvez recomende a cantina'}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

function configurarModal() {
    const modal = document.getElementById('modal-detalhes');
    const span = document.getElementsByClassName('close')[0];
    
    span.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function configurarEventos() {
    // Configurar botões da header já definidos no HTML
}

function atualizarDados() {
    const btn = document.querySelector('.btn-refresh');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Atualizando...';
    btn.disabled = true;
    
    setTimeout(() => {
        carregarDados();
        btn.textContent = originalText;
        btn.disabled = false;
        
        // Mostrar mensagem de sucesso
        mostrarMensagem('Dados atualizados com sucesso!', 'success');
    }, 1000);
}

function exportarDados() {
    if (dadosAvaliacoes.length === 0) {
        mostrarMensagem('Não há dados para exportar', 'error');
        return;
    }
    
    // Converter para CSV
    const csvContent = converterParaCSV(dadosAvaliacoes);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `avaliacoes_cantina_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarMensagem('Dados exportados com sucesso!', 'success');
    }
}

function converterParaCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Adicionar cabeçalhos
    csvRows.push(headers.join(';'));
    
    // Adicionar linhas de dados
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(';'));
    });
    
    return csvRows.join('\n');
}

function mostrarMensagem(texto, tipo) {
    const mensagem = document.createElement('div');
    mensagem.className = `message ${tipo}`;
    mensagem.textContent = texto;
    
    const container = document.querySelector('.dashboard-container');
    container.insertBefore(mensagem, container.firstChild);
    
    setTimeout(() => {
        mensagem.remove();
    }, 5000);
}