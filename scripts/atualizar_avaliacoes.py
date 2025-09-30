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

    # Carregar modelo pré-treinado multilíngue
    classifier = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

    preds, scores = [], []

    # Loop pelos comentários
    for text in df["Comentários"].tolist():
        if isinstance(text, str) and text.strip():  # só analisa se tem comentário
            result = classifier(text[:512])[0]
            label = result['label']   # ex: "3 stars"
            stars = int(label.split()[0])  # extrai número
            scores.append(stars)

            if stars <= 2:
                preds.append("NEG")
            elif stars == 3:
                preds.append("NEU")
            else:
                preds.append("POS")
        else:
            preds.append(pd.NA)   # sem comentário
            scores.append(pd.NA)

    df["bert_label"] = preds
    df["model_score"] = scores

    # Salvar CSV atualizado
    df.to_csv("avaliacoes.csv", index=False, sep=";")

atualizar_avaliacoes()
