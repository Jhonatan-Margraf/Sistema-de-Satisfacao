# Importando Bibliotecas necessárias
import pandas as pd
from transformers import pipeline
import requests
import io

def atualizar_avaliacoes():
    # Baixar CSV
    url = "https://avaliacao.cantina.vnt.app.br/exportar.php"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    resp = requests.get(url, headers=headers)
    df = pd.read_csv(io.StringIO(resp.text), sep=";", quotechar='"')

    # Limpar comentários nulos
    df = df.dropna(subset=["Comentários"]).copy()

    # Carregar modelo pré-treinado multilíngue
    classifier = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

    # Listas para resultados
    preds = []
    scores = []

    for text in df["Comentários"].tolist():
        result = classifier(text[:512])[0]  # limite do BERT
        label = result['label']
        score = result['score']

        # Extrair número da estrela (primeiro caractere da string "3 stars")
        scores.append(label[0])

        # Reclassificação em NEG/NEU/POS
        if "1" in label or "2" in label:
            preds.append("NEG")
        elif "3" in label:
            preds.append("NEU")
        else:  # 4 ou 5
            preds.append("POS")

    # Criar colunas no dataframe
    df["bert_label"] = preds
    df["model_score"] = scores

    # Salvar CSV para uso no Power BI
    df.to_csv("avaliacoes.csv", index=False, sep=";")

# Testar a função
atualizar_avaliacoes()
