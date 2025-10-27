#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de Satisfação da Cantina - Processamento de Questionários
Este script processa as respostas do questionário e integra com o sistema de análise existente.
"""

import json
import pandas as pd
import csv
from datetime import datetime
import os
from typing import Dict, List, Any
import statistics

class QuestionarioProcessor:
    """Classe para processar dados do questionário de satisfação da cantina."""
    
    def __init__(self, csv_file: str = "questionarios_cantina.csv"):
        self.csv_file = csv_file
        self.campos_numericos = [
            'sabor', 'qualidade', 'variedade', 'atendimento', 'tempo',
            'limpeza', 'espaco', 'precos', 'satisfacao'
        ]
    
    def processar_dados_questionario(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa os dados do questionário e calcula métricas.
        
        Args:
            dados: Dicionário com os dados do formulário
            
        Returns:
            Dicionário com dados processados e métricas calculadas
        """
        # Calcular score geral
        dados['score_geral'] = self._calcular_score_geral(dados)
        
        # Classificar satisfação
        dados['classificacao'] = self._classificar_satisfacao(dados['score_geral'])
        
        # Processar comentários para análise de sentimento
        comentarios = []
        if dados.get('sugestoes'):
            comentarios.append(dados['sugestoes'])
        if dados.get('comentarios'):
            comentarios.append(dados['comentarios'])
        
        if comentarios:
            dados['comentarios_combinados'] = ' '.join(comentarios)
        
        # Adicionar timestamp se não existir
        if 'timestamp' not in dados:
            dados['timestamp'] = datetime.now().isoformat()
        
        return dados
    
    def _calcular_score_geral(self, dados: Dict[str, Any]) -> float:
        """Calcula o score geral baseado nas avaliações numéricas."""
        scores = []
        for campo in self.campos_numericos:
            if dados.get(campo):
                try:
                    scores.append(int(dados[campo]))
                except (ValueError, TypeError):
                    continue
        
        return round(statistics.mean(scores), 2) if scores else 0.0
    
    def _classificar_satisfacao(self, score: float) -> str:
        """Classifica o nível de satisfação baseado no score."""
        if score >= 4.5:
            return "Muito Satisfeito"
        elif score >= 3.5:
            return "Satisfeito"
        elif score >= 2.5:
            return "Neutro"
        elif score >= 1.5:
            return "Insatisfeito"
        else:
            return "Muito Insatisfeito"
    
    def salvar_questionario(self, dados: Dict[str, Any]) -> bool:
        """
        Salva os dados do questionário no arquivo CSV.
        
        Args:
            dados: Dados processados do questionário
            
        Returns:
            True se salvou com sucesso, False caso contrário
        """
        try:
            dados_processados = self.processar_dados_questionario(dados)
            
            # Verificar se arquivo existe para decidir se adiciona cabeçalho
            arquivo_existe = os.path.exists(self.csv_file)
            
            # Definir colunas na ordem desejada
            colunas = [
                'id', 'timestamp', 'turma', 'frequencia', 'sabor', 'qualidade',
                'variedade', 'atendimento', 'tempo', 'limpeza', 'espaco',
                'precos', 'satisfacao', 'recomendacao', 'score_geral',
                'classificacao', 'sugestoes', 'comentarios',
                'comentarios_combinados', 'anonimo', 'nome', 'email'
            ]
            
            with open(self.csv_file, 'a', newline='', encoding='utf-8') as arquivo:
                writer = csv.DictWriter(arquivo, fieldnames=colunas, delimiter=';')
                
                # Escrever cabeçalho se arquivo não existe
                if not arquivo_existe:
                    writer.writeheader()
                
                # Escrever dados
                writer.writerow({col: dados_processados.get(col, '') for col in colunas})
            
            return True
            
        except Exception as e:
            print(f"Erro ao salvar questionário: {e}")
            return False
    
    def carregar_questionarios(self) -> pd.DataFrame:
        """Carrega todos os questionários do arquivo CSV."""
        try:
            if os.path.exists(self.csv_file):
                return pd.read_csv(self.csv_file, sep=';', encoding='utf-8')
            else:
                return pd.DataFrame()
        except Exception as e:
            print(f"Erro ao carregar questionários: {e}")
            return pd.DataFrame()
    
    def gerar_relatorio(self) -> Dict[str, Any]:
        """Gera relatório estatístico dos questionários."""
        df = self.carregar_questionarios()
        
        if df.empty:
            return {"erro": "Não há dados para gerar relatório"}
        
        relatorio = {
            "total_respostas": len(df),
            "data_relatorio": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "estatisticas_gerais": {},
            "distribuicao_classificacao": {},
            "medias_por_categoria": {},
            "frequencia_uso": {},
            "recomendacao": {},
            "sugestoes_mais_comuns": []
        }
        
        # Estatísticas gerais
        if 'score_geral' in df.columns:
            relatorio["estatisticas_gerais"] = {
                "score_medio": round(df['score_geral'].mean(), 2),
                "score_mediano": round(df['score_geral'].median(), 2),
                "score_maximo": round(df['score_geral'].max(), 2),
                "score_minimo": round(df['score_geral'].min(), 2)
            }
        
        # Distribuição por classificação
        if 'classificacao' in df.columns:
            classificacao_counts = df['classificacao'].value_counts()
            relatorio["distribuicao_classificacao"] = {
                classificacao: int(count) for classificacao, count in classificacao_counts.items()
            }
        
        # Médias por categoria
        for campo in self.campos_numericos:
            if campo in df.columns:
                media = df[campo].astype('float', errors='ignore').mean()
                if not pd.isna(media):
                    relatorio["medias_por_categoria"][campo] = round(media, 2)
        
        # Frequência de uso
        if 'frequencia' in df.columns:
            freq_counts = df['frequencia'].value_counts()
            relatorio["frequencia_uso"] = {
                freq: int(count) for freq, count in freq_counts.items()
            }
        
        # Recomendação
        if 'recomendacao' in df.columns:
            rec_counts = df['recomendacao'].value_counts()
            relatorio["recomendacao"] = {
                rec: int(count) for rec, count in rec_counts.items()
            }
        
        return relatorio
    
    def exportar_para_analise_sentimento(self) -> str:
        """
        Exporta comentários para análise de sentimento no formato esperado
        pelo script atualizar_avaliacoes.py
        """
        df = self.carregar_questionarios()
        
        if df.empty or 'comentarios_combinados' not in df.columns:
            return "Não há comentários para exportar"
        
        # Filtrar apenas registros com comentários
        df_comentarios = df[df['comentarios_combinados'].notna() & 
                          (df['comentarios_combinados'].str.strip() != '')]
        
        if df_comentarios.empty:
            return "Não há comentários válidos para exportar"
        
        # Criar arquivo CSV no formato esperado pelo sistema de análise
        arquivo_export = "comentarios_para_analise.csv"
        
        df_export = pd.DataFrame({
            'ID': df_comentarios['id'],
            'Data': df_comentarios['timestamp'],
            'Comentários': df_comentarios['comentarios_combinados'],
            'Score_Questionario': df_comentarios['score_geral'],
            'Classificacao': df_comentarios['classificacao']
        })
        
        df_export.to_csv(arquivo_export, sep=';', index=False, encoding='utf-8')
        
        return f"Comentários exportados para {arquivo_export}"

def main():
    """Função principal para testar o processador."""
    processor = QuestionarioProcessor()
    
    # Exemplo de dados de teste
    dados_teste = {
        'id': 'eval_test_001',
        'timestamp': datetime.now().isoformat(),
        'turma': '2ano',
        'frequencia': 'diariamente',
        'sabor': '4',
        'qualidade': '4',
        'variedade': '3',
        'atendimento': '5',
        'tempo': '3',
        'limpeza': '4',
        'espaco': '3',
        'precos': '2',
        'satisfacao': '4',
        'recomendacao': 'sim',
        'sugestoes': 'Poderia ter mais opções vegetarianas',
        'comentarios': 'No geral estou satisfeito com a cantina',
        'anonimo': 'on',
        'nome': '',
        'email': ''
    }
    
    # Testar processamento e salvamento
    print("Testando processamento de questionário...")
    if processor.salvar_questionario(dados_teste):
        print("✅ Questionário salvo com sucesso!")
    else:
        print("❌ Erro ao salvar questionário")
    
    # Gerar relatório
    print("\nGerando relatório...")
    relatorio = processor.gerar_relatorio()
    print(json.dumps(relatorio, indent=2, ensure_ascii=False))
    
    # Exportar para análise
    print("\nExportando para análise de sentimento...")
    resultado_export = processor.exportar_para_analise_sentimento()
    print(resultado_export)

if __name__ == "__main__":
    main()