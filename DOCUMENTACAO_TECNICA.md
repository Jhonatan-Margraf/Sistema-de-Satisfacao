# Documentação Técnica - Sistema de Satisfação da Cantina

## Resumo Técnico Expandido

Este documento fornece a documentação técnica atualizada para o Sistema de Satisfação da Cantina, complementando o artigo acadêmico com detalhes técnicos da implementação atual.

## Metodologia Implementada

### Análise de Sentimentos com BERT

O sistema utiliza o modelo BERT (Bidirectional Encoder Representations from Transformers) pré-treinado multilíngue para análise de sentimentos dos comentários dos usuários.

**Modelo Utilizado:**
- `nlptown/bert-base-multilingual-uncased-sentiment`
- Suporte a múltiplos idiomas incluindo português
- Classificação em 5 categorias (1-5 estrelas)

**Pipeline de Processamento:**
1. **Coleta de Dados**: Extração automática via endpoint `/exportar.php`
2. **Pré-processamento**: Limpeza de comentários nulos e limitação de 512 tokens
3. **Análise de Sentimentos**: Classificação utilizando BERT
4. **Reclassificação**: Agrupamento em categorias NEG/NEU/POS
5. **Persistência**: Exportação para CSV para análise no Power BI

### Arquitetura do Sistema

```
[API Coleta] → [Processamento BERT] → [Classificação] → [Power BI]
     ↓                ↓                    ↓             ↓
[dados.csv] → [transformers] → [avaliacoes.csv] → [Dashboard]
```

## Especificações Técnicas

### Dependências
- **pandas**: Manipulação de dados tabulares
- **transformers**: Biblioteca Hugging Face para modelos BERT
- **requests**: Cliente HTTP para coleta de dados
- **torch**: Framework de deep learning (backend)

### Configuração de Automação
- **Frequência**: Execução diária às 08:00 BRT
- **Plataforma**: GitHub Actions com Ubuntu Latest
- **Python**: Versão 3.12

## Algoritmo de Classificação

```python
def classificar_sentimento(texto):
    resultado = bert_classifier(texto[:512])
    estrelas = int(resultado['label'][0])
    
    if estrelas in [1, 2]:
        return "NEG"  # Negativo
    elif estrelas == 3:
        return "NEU"  # Neutro
    else:  # estrelas in [4, 5]
        return "POS"  # Positivo
```

## Métricas e Validação

### Critérios de Qualidade
- **Precisão**: Avaliação baseada na correspondência com avaliações manuais
- **Robustez**: Tratamento de textos curtos e longos
- **Escalabilidade**: Processamento automatizado via GitHub Actions

### Limitações Identificadas
- Limite de 512 tokens por comentário (limitação do BERT)
- Dependência de conectividade para modelo pré-treinado
- Análise baseada apenas em texto (sem contexto visual)

## Resultados Esperados

### Categorização Automática
- **NEG**: Comentários com 1-2 estrelas (insatisfação)
- **NEU**: Comentários com 3 estrelas (neutro)
- **POS**: Comentários com 4-5 estrelas (satisfação)

### Aplicações Práticas
1. **Dashboard Gerencial**: Visualização em tempo real via Power BI
2. **Análise Temporal**: Acompanhamento de tendências de satisfação
3. **Alertas Automáticos**: Identificação de problemas recorrentes
4. **Relatórios Periódicos**: Métricas de desempenho da cantina

## Contribuições para a Literatura

### Inovações Técnicas
- Aplicação de BERT multilíngue em ambiente educacional brasileiro
- Automação completa do pipeline de análise de sentimentos
- Integração com ferramentas de business intelligence

### Relevância Científica
- Validação de modelos pré-treinados em contexto específico (cantina escolar)
- Estudo de caso de implementação prática de NLP em gestão educacional
- Contribuição para pesquisas em satisfação do consumidor em ambientes educacionais

## Trabalhos Futuros

### Melhorias Técnicas Propostas
1. **Fine-tuning**: Adaptação do modelo BERT para domínio específico
2. **Análise Multimodal**: Incorporação de imagens e avaliações numéricas
3. **Processamento em Tempo Real**: Implementação de streaming de dados
4. **Análise de Aspectos**: Identificação de tópicos específicos (preço, qualidade, atendimento)

### Expansão do Sistema
- Integração com outros setores da instituição
- Análise comparativa entre diferentes períodos letivos
- Sistema de recomendações baseado em feedback

---

**Nota**: Esta documentação técnica serve como complemento ao artigo acadêmico "Sistema de Satisfação da Cantina" e deve ser utilizada para atualizações do resumo expandido com informações técnicas precisas da implementação atual.