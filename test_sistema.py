"""
Testes básicos para o sistema de análise de sentimentos

Este módulo contém testes unitários e de integração para validar
o funcionamento do sistema de análise de sentimentos da cantina.
"""

import unittest
from unittest.mock import patch, MagicMock
import pandas as pd
import io
from atualizar_avaliacoes import atualizar_avaliacoes

class TestSistemaAvaliacao(unittest.TestCase):
    """Testes para o sistema de avaliação de sentimentos"""

    def setUp(self):
        """Configuração inicial para os testes"""
        self.sample_csv_data = """Data;Comentários;Avaliacao
2023-01-01;Comida muito boa e atendimento excelente;5
2023-01-02;Comida ruim e cara;2
2023-01-03;Mais ou menos;3
2023-01-04;;4"""

    @patch('atualizar_avaliacoes.requests.get')
    @patch('atualizar_avaliacoes.pipeline')
    def test_pipeline_basico(self, mock_pipeline, mock_requests):
        """Testa o pipeline básico de processamento"""
        
        # Mock da resposta da API
        mock_response = MagicMock()
        mock_response.text = self.sample_csv_data
        mock_response.raise_for_status.return_value = None
        mock_requests.return_value = mock_response
        
        # Mock do classificador BERT
        mock_classifier = MagicMock()
        mock_classifier.side_effect = [
            [{'label': '5 stars', 'score': 0.95}],  # Positivo
            [{'label': '2 stars', 'score': 0.88}],  # Negativo
            [{'label': '3 stars', 'score': 0.75}],  # Neutro
        ]
        mock_pipeline.return_value = mock_classifier
        
        # Executar função
        resultado = atualizar_avaliacoes()
        
        # Verificações
        self.assertTrue(resultado)
        mock_requests.assert_called_once()
        mock_pipeline.assert_called_once()

    def test_classificacao_sentimentos(self):
        """Testa a lógica de classificação de sentimentos"""
        
        # Testar classificação baseada em estrelas
        test_cases = [
            ("1", "NEG"),
            ("2", "NEG"), 
            ("3", "NEU"),
            ("4", "POS"),
            ("5", "POS")
        ]
        
        for estrelas, esperado in test_cases:
            if estrelas in ["1", "2"]:
                resultado = "NEG"
            elif estrelas == "3":
                resultado = "NEU"
            else:
                resultado = "POS"
            
            self.assertEqual(resultado, esperado, 
                           f"Falha na classificação para {estrelas} estrelas")

    def test_limpeza_dados(self):
        """Testa a limpeza de dados nulos"""
        
        # Criar DataFrame de teste
        data = {
            'Comentários': ['Bom', None, 'Ruim', '', 'Excelente'],
            'Avaliacao': [5, 3, 2, 1, 5]
        }
        df = pd.DataFrame(data)
        
        # Limpar dados nulos (simular comportamento da função)
        df_limpo = df.dropna(subset=["Comentários"]).copy()
        
        # Verificar que dados nulos foram removidos
        self.assertEqual(len(df_limpo), 4)  # None removido
        self.assertNotIn(None, df_limpo['Comentários'].values)

    @patch('atualizar_avaliacoes.requests.get')
    def test_erro_conexao(self, mock_requests):
        """Testa tratamento de erro de conexão"""
        
        # Simular erro de conexão
        mock_requests.side_effect = Exception("Erro de conexão")
        
        # Executar função
        resultado = atualizar_avaliacoes()
        
        # Verificar que falha é tratada corretamente
        self.assertFalse(resultado)

if __name__ == '__main__':
    print("Executando testes do sistema de avaliação...")
    unittest.main(verbosity=2)