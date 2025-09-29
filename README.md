# 📊 Sistema de Satisfação da Cantina

Este repositório apresenta o desenvolvimento de um sistema voltado para a coleta e análise de feedbacks de usuários (alunos) em relação à cantina escolar, visando melhorar a qualidade do serviço oferecido.

## 🧑‍💻 Discentes responsáveis

- Anthony Guilherme Mucelini  
- Gabrieli Cavalcante Boeira  
- Jhonatan da Silva Margraf  
- Luan Bitencourt Sarmento  
- Rafaela Eduarda de Oliveira Barreiros  

---

## 📝 Objetivo

O projeto tem como objetivo aplicar conceitos de sistemas de avaliação e feedback em um ambiente escolar, utilizando recursos tecnológicos para facilitar a coleta de opiniões, sugestões e reclamações sobre o atendimento, qualidade dos produtos e estrutura da cantina.

---

## 🧠 Base Teórica

O projeto está fundamentado em estudos sobre tipos de feedback, como:

- Feedback positivo, negativo e construtivo  
- Feedback formal, informal, imediato e contínuo  
- Feedback 360 graus  

Além disso, nos inspiramos em sistemas reais como:

- **Sistema de Localização e Avaliação de Restaurantes**  
- **Sistemas de medição de satisfação do consumidor (Kotler)**  
- **Estudos de avaliação de desempenho em hospitais públicos no Brasil**

---

## 🛠 Funcionalidades Implementadas

- ✅ **Questionário Digital Estruturado**: Formulário completo para coleta de feedbacks
- ✅ **Análise de Sentimentos**: Sistema automatizado usando modelo BERT multilíngue
- ✅ **Coleta de Dados Organizada**: Armazenamento em CSV com processamento automático
- ✅ **Sistema de Pontuação**: Cálculo automático de score de satisfação
- ✅ **Avaliação Anônima ou Identificada**: Opção de privacidade para o usuário
- ✅ **Interface Responsiva**: Design adaptável para dispositivos móveis
- ✅ **Validação de Dados**: Sistema robusto de validação no frontend e backend

## 🆕 Novo Sistema de Questionário

### Características do Questionário:
- **📋 8 Seções Organizadas**:
  1. Informações Gerais (turma, frequência de uso)
  2. Qualidade dos Alimentos (sabor, frescor, variedade)
  3. Atendimento e Serviço (qualidade do atendimento, tempo de espera)
  4. Ambiente e Infraestrutura (limpeza, espaço físico)
  5. Preços (avaliação dos valores praticados)
  6. Satisfação Geral (satisfação global e recomendação)
  7. Sugestões e Comentários (feedback aberto)
  8. Identificação Opcional (anonimato garantido)

### Tecnologias Utilizadas:
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+ / Python 3.8+
- **Armazenamento**: CSV com estrutura otimizada
- **Análise**: BERT multilíngue para análise de sentimentos
- **Interface**: Design responsivo com animações suaves

### Métricas Calculadas:
- Score geral de satisfação (1-5)
- Classificação automática (Muito Insatisfeito → Muito Satisfeito)
- Análise de sentimentos dos comentários
- Estatísticas por categoria de avaliação

---

## 🚀 Como Usar o Sistema

### Para Usuários (Alunos/Funcionários):
1. **Acesse o Questionário**: Abra o arquivo `questionario.html` em qualquer navegador
2. **Preencha as Seções**: Complete todas as seções obrigatórias do formulário
3. **Envie sua Avaliação**: Clique em "Enviar Avaliação" para submeter seus dados
4. **Privacidade**: Mantenha marcada a opção "anônimo" se preferir não se identificar

### Para Administradores:
1. **Coleta de Dados**: Use `receber_questionario.php` como endpoint para receber dados
2. **Processamento**: Execute `processar_questionario.py` para análises detalhadas
3. **Análise de Sentimentos**: Use `atualizar_avaliacoes.py` para análise dos comentários
4. **Relatórios**: Gere relatórios automatizados com estatísticas completas

### Arquivos do Sistema:
- `questionario.html` - Interface do formulário
- `style.css` - Estilos e design responsivo
- `questionario.js` - Funcionalidades do frontend
- `receber_questionario.php` - Backend de recebimento
- `processar_questionario.py` - Processamento e análise
- `atualizar_avaliacoes.py` - Análise de sentimentos (existente)

---

## 📬 Contato

Em caso de dúvidas ou sugestões, entre em contato com qualquer um dos discentes listados acima.
