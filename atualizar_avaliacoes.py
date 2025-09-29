"""
Sistema de Satisfação da Cantina - Análise Automatizada de Sentimentos

Este módulo implementa a análise automatizada de sentimentos para feedbacks
de cantina escolar utilizando o modelo BERT multilíngue pré-treinado.

Autores:
- Anthony Guilherme Mucelini
- Gabrieli Cavalcante Boeira  
- Jhonatan da Silva Margraf
- Luan Bitencourt Sarmento
- Rafaela Eduarda de Oliveira Barreiros

Modelo BERT utilizado: nlptown/bert-base-multilingual-uncased-sentiment
"""

import pandas as pd
from transformers import pipeline
import requests
import io
import logging
from datetime import datetime

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def atualizar_avaliacoes():
    """
    Executa o pipeline completo de análise de sentimentos:
    1. Coleta dados via API
    2. Processa comentários com BERT
    3. Classifica sentimentos em NEG/NEU/POS
    4. Salva resultados em CSV
    
    Returns:
        bool: True se executado com sucesso, False caso contrário
    """
    try:
        logger.info("Iniciando atualização de avaliações...")
        
        # Baixar CSV da API
        url = "https://avaliacao.cantina.vnt.app.br/exportar.php"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

        logger.info(f"Coletando dados de: {url}")
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        
        df = pd.read_csv(io.StringIO(resp.text), sep=";", quotechar='"')
        logger.info(f"Dados coletados: {len(df)} registros")

        # Limpar comentários nulos
        df_original_size = len(df)
        df = df.dropna(subset=["Comentários"]).copy()
        logger.info(f"Após limpeza: {len(df)} registros válidos ({df_original_size - len(df)} removidos)")

        if len(df) == 0:
            logger.warning("Nenhum comentário válido encontrado")
            return False

        # Carregar modelo BERT pré-treinado multilíngue
        logger.info("Carregando modelo BERT multilíngue...")
        classifier = pipeline(
            "sentiment-analysis", 
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            return_all_scores=False
        )

        # Listas para resultados
        preds = []
        scores = []

        logger.info("Processando comentários com BERT...")
        for i, text in enumerate(df["Comentários"].tolist()):
            try:
                # Processar com BERT (limite de 512 tokens)
                result = classifier(text[:512])[0]
                label = result['label']
                score = result['score']

                # Extrair número da estrela (primeiro caractere da string "X stars")
                star_rating = label[0]
                scores.append(star_rating)

                # Reclassificação em categorias NEG/NEU/POS
                if star_rating in ["1", "2"]:
                    sentiment = "NEG"
                elif star_rating == "3":
                    sentiment = "NEU"
                else:  # 4 ou 5 estrelas
                    sentiment = "POS"
                
                preds.append(sentiment)

                # Log progresso a cada 100 comentários
                if (i + 1) % 100 == 0:
                    logger.info(f"Processados {i + 1}/{len(df)} comentários")

            except Exception as e:
                logger.error(f"Erro ao processar comentário {i}: {str(e)}")
                # Valores padrão em caso de erro
                scores.append("3")
                preds.append("NEU")

        # Adicionar colunas com resultados da análise
        df["bert_label"] = preds
        df["model_score"] = scores
        df["processamento_timestamp"] = datetime.now().isoformat()

        # Salvar CSV para uso no Power BI
        output_file = "avaliacoes.csv"
        df.to_csv(output_file, index=False, sep=";", encoding='utf-8')
        
        # Estatísticas finais
        stats = df["bert_label"].value_counts()
        logger.info(f"Análise concluída - Distribuição: {dict(stats)}")
        logger.info(f"Arquivo salvo: {output_file} ({len(df)} registros)")
        
        return True

    except requests.RequestException as e:
        logger.error(f"Erro na coleta de dados: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        return False

if __name__ == "__main__":
    # Executar o pipeline
    sucesso = atualizar_avaliacoes()
    if sucesso:
        logger.info("Pipeline executado com sucesso!")
    else:
        logger.error("Falha na execução do pipeline")
        exit(1)
