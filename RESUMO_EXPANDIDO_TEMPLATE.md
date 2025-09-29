# Resumo Expandido - Template Atualizado

## Sistema de Satisfação da Cantina: Análise Automatizada de Sentimentos Utilizando BERT Multilíngue

### Resumo

Este trabalho apresenta o desenvolvimento e implementação de um sistema automatizado para análise de satisfação de usuários em cantinas escolares, utilizando técnicas avançadas de processamento de linguagem natural (NLP) baseadas no modelo BERT multilíngue. O sistema coleta feedbacks através de formulários digitais, processa automaticamente os comentários usando análise de sentimentos e gera relatórios visuais através de dashboards interativos. A implementação utiliza o modelo pré-treinado `nlptown/bert-base-multilingual-uncased-sentiment` para classificação automática de comentários em categorias negativas, neutras e positivas. O processo é totalmente automatizado através de GitHub Actions, executando diariamente para manter os dados atualizados. Os resultados demonstram a eficácia da aplicação de modelos BERT em contextos educacionais brasileiros, fornecendo insights valiosos para gestores educacionais sobre a qualidade dos serviços de alimentação escolar.

**Palavras-chave:** Análise de sentimentos, BERT, Satisfação do consumidor, Sistemas educacionais, Business Intelligence.

### 1. Introdução

A qualidade dos serviços de alimentação em instituições educacionais é um fator crucial para a satisfação e bem-estar dos estudantes. Com o crescimento da aplicação de tecnologias de inteligência artificial em diversos setores, surge a oportunidade de modernizar os sistemas de avaliação e feedback em ambientes educacionais.

Este estudo propõe um sistema automatizado para coleta, análise e visualização de feedbacks sobre serviços de cantina escolar, utilizando técnicas state-of-the-art de processamento de linguagem natural, especificamente o modelo BERT (Bidirectional Encoder Representations from Transformers) em sua versão multilíngue.

### 2. Fundamentação Teórica

#### 2.1 Análise de Sentimentos em Texto

A análise de sentimentos, também conhecida como mineração de opinião, é uma área do processamento de linguagem natural que se concentra na identificação e extração de opiniões, emoções e atitudes expressas em texto (Pang & Lee, 2008). O desenvolvimento de modelos baseados em transformers, particularmente o BERT, revolucionou esta área ao permitir compreensão contextual bidirecionada do texto.

#### 2.2 Modelo BERT Multilíngue

O BERT (Devlin et al., 2018) representa um marco na área de NLP, utilizando arquitetura de transformers para pré-treinamento em grandes corpora de texto. A versão multilíngue estende essas capacidades para múltiplos idiomas, sendo particularmente relevante para aplicações em português brasileiro.

#### 2.3 Sistemas de Feedback Educacional

Sistemas de feedback eficazes são fundamentais para a melhoria contínua de serviços educacionais (Hill, 1995). A automação destes processos através de IA permite análises mais frequentes e objetivas, reduzindo o viés humano na interpretação dos dados.

### 3. Metodologia

#### 3.1 Arquitetura do Sistema

O sistema foi desenvolvido com uma arquitetura modular composta por:

1. **Módulo de Coleta**: Interface web para submissão de feedbacks
2. **Módulo de Processamento**: Pipeline automatizado com BERT
3. **Módulo de Visualização**: Dashboard interativo com Power BI
4. **Módulo de Automação**: GitHub Actions para execução periódica

#### 3.2 Pipeline de Processamento

```
Dados Brutos → Pré-processamento → BERT Classifier → Categorização → Visualização
```

O pipeline processa os dados seguindo estas etapas:

1. **Coleta Automatizada**: Extração via API endpoint
2. **Limpeza de Dados**: Remoção de entradas nulas e normalização
3. **Tokenização**: Limitação de 512 tokens conforme especificação BERT
4. **Classificação**: Aplicação do modelo pré-treinado
5. **Reclassificação**: Agrupamento em categorias NEG/NEU/POS
6. **Persistência**: Geração de arquivo CSV para análise

#### 3.3 Implementação Técnica

O sistema foi implementado em Python utilizando as seguintes tecnologias:

- **Transformers (Hugging Face)**: Para acesso ao modelo BERT
- **Pandas**: Manipulação de dados estruturados
- **Requests**: Comunicação HTTP para coleta de dados
- **GitHub Actions**: Automação de execução

### 4. Resultados e Discussão

#### 4.1 Classificação Automática

O sistema demonstrou capacidade de classificação automática de feedbacks com as seguintes categorias:

- **Negativo (NEG)**: Avaliações de 1-2 estrelas
- **Neutro (NEU)**: Avaliações de 3 estrelas  
- **Positivo (POS)**: Avaliações de 4-5 estrelas

#### 4.2 Automação Operacional

A implementação de GitHub Actions permitiu:

- Execução diária automática às 08:00 BRT
- Processamento contínuo sem intervenção manual
- Atualização automática de dashboards
- Versionamento de dados históricos

#### 4.3 Impactos Práticos

O sistema fornece aos gestores educacionais:

1. **Visibilidade em Tempo Real**: Dashboards atualizados diariamente
2. **Análise Temporal**: Identificação de tendências de satisfação
3. **Alertas Automáticos**: Detecção de problemas recorrentes
4. **Relatórios Objetivos**: Métricas quantitativas de desempenho

### 5. Limitações e Trabalhos Futuros

#### 5.1 Limitações Identificadas

- Limite de 512 tokens por comentário
- Dependência de conectividade para modelo pré-treinado
- Análise restrita a conteúdo textual

#### 5.2 Propostas de Melhoria

- Fine-tuning do modelo para domínio específico
- Implementação de análise multimodal
- Desenvolvimento de sistema de recomendações
- Expansão para outros setores da instituição

### 6. Conclusões

Este trabalho demonstrou a viabilidade e eficácia da aplicação de modelos BERT multilíngue em sistemas de análise de satisfação em ambientes educacionais brasileiros. A automação completa do processo, desde a coleta até a visualização, representa uma contribuição significativa para a modernização de sistemas de feedback em instituições educacionais.

A implementação bem-sucedida do sistema valida a aplicabilidade de técnicas avançadas de NLP em contextos práticos, fornecendo uma ferramenta valiosa para gestores educacionais na tomada de decisões baseada em dados.

### Agradecimentos

Os autores agradecem à instituição de ensino pela disponibilização dos dados e infraestrutura necessária para o desenvolvimento deste trabalho.

### Referências

[Ver arquivo BIBLIOGRAFIA.md para referências completas]

---

**Informações dos Autores:**

- Anthony Guilherme Mucelini
- Gabrieli Cavalcante Boeira  
- Jhonatan da Silva Margraf
- Luan Bitencourt Sarmento
- Rafaela Eduarda de Oliveira Barreiros

**Correspondência:** [Inserir email de contato]

**Conflito de Interesses:** Os autores declaram não haver conflito de interesses.

**Financiamento:** Pesquisa realizada com recursos próprios da instituição.