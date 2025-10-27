<?php
/**
 * Sistema de Satisfação da Cantina - Backend de Recebimento de Questionários
 * 
 * Este script PHP recebe os dados do formulário e os salva para processamento.
 * Pode ser usado como endpoint para o formulário HTML.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurações
$csv_file = 'questionarios_cantina.csv';
$log_file = 'questionarios.log';

/**
 * Função para gerar ID único
 */
function gerarId() {
    return 'eval_' . time() . '_' . bin2hex(random_bytes(4));
}

/**
 * Função para calcular score geral
 */
function calcularScoreGeral($dados) {
    $campos_numericos = ['sabor', 'qualidade', 'variedade', 'atendimento', 'tempo', 'limpeza', 'espaco', 'precos', 'satisfacao'];
    $scores = [];
    
    foreach ($campos_numericos as $campo) {
        if (isset($dados[$campo]) && is_numeric($dados[$campo])) {
            $scores[] = (int)$dados[$campo];
        }
    }
    
    return !empty($scores) ? round(array_sum($scores) / count($scores), 2) : 0;
}

/**
 * Função para classificar satisfação
 */
function classificarSatisfacao($score) {
    if ($score >= 4.5) return "Muito Satisfeito";
    if ($score >= 3.5) return "Satisfeito";
    if ($score >= 2.5) return "Neutro";
    if ($score >= 1.5) return "Insatisfeito";
    return "Muito Insatisfeito";
}

/**
 * Função para validar dados
 */
function validarDados($dados) {
    $erros = [];
    
    // Campos obrigatórios
    $obrigatorios = ['turma', 'frequencia', 'sabor', 'qualidade', 'variedade', 'atendimento', 'tempo', 'limpeza', 'espaco', 'precos', 'satisfacao', 'recomendacao'];
    
    foreach ($obrigatorios as $campo) {
        if (!isset($dados[$campo]) || empty(trim($dados[$campo]))) {
            $erros[] = "Campo '$campo' é obrigatório";
        }
    }
    
    // Validar email se fornecido
    if (!empty($dados['email']) && !filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
        $erros[] = "Email inválido";
    }
    
    // Validar valores numéricos
    $campos_numericos = ['sabor', 'qualidade', 'variedade', 'atendimento', 'tempo', 'limpeza', 'espaco', 'precos', 'satisfacao'];
    foreach ($campos_numericos as $campo) {
        if (isset($dados[$campo])) {
            $valor = (int)$dados[$campo];
            if ($valor < 1 || $valor > 5) {
                $erros[] = "Campo '$campo' deve ter valor entre 1 e 5";
            }
        }
    }
    
    return $erros;
}

/**
 * Função para salvar no CSV
 */
function salvarCSV($dados, $arquivo) {
    try {
        $arquivo_existe = file_exists($arquivo);
        $handle = fopen($arquivo, 'a');
        
        if (!$handle) {
            throw new Exception("Não foi possível abrir o arquivo CSV");
        }
        
        // Definir colunas
        $colunas = [
            'id', 'timestamp', 'turma', 'frequencia', 'sabor', 'qualidade',
            'variedade', 'atendimento', 'tempo', 'limpeza', 'espaco',
            'precos', 'satisfacao', 'recomendacao', 'score_geral',
            'classificacao', 'sugestoes', 'comentarios', 'comentarios_combinados',
            'anonimo', 'nome', 'email'
        ];
        
        // Escrever cabeçalho se arquivo não existe
        if (!$arquivo_existe) {
            fputcsv($handle, $colunas, ';');
        }
        
        // Preparar linha de dados
        $linha = [];
        foreach ($colunas as $coluna) {
            $linha[] = isset($dados[$coluna]) ? $dados[$coluna] : '';
        }
        
        // Escrever dados
        fputcsv($handle, $linha, ';');
        fclose($handle);
        
        return true;
        
    } catch (Exception $e) {
        error_log("Erro ao salvar CSV: " . $e->getMessage());
        return false;
    }
}

/**
 * Função para registrar log
 */
function registrarLog($mensagem, $arquivo_log) {
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[$timestamp] $mensagem" . PHP_EOL;
    file_put_contents($arquivo_log, $log_entry, FILE_APPEND | LOCK_EX);
}

// Processar requisição
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    // Obter dados JSON ou form data
    $input = file_get_contents('php://input');
    $dados = json_decode($input, true);
    
    // Se não é JSON, tentar $_POST
    if (!$dados) {
        $dados = $_POST;
    }
    
    if (empty($dados)) {
        throw new Exception('Nenhum dado recebido');
    }
    
    // Validar dados
    $erros = validarDados($dados);
    if (!empty($erros)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Dados inválidos',
            'detalhes' => $erros
        ]);
        exit();
    }
    
    // Processar dados
    $dados['id'] = gerarId();
    $dados['timestamp'] = date('Y-m-d H:i:s');
    $dados['score_geral'] = calcularScoreGeral($dados);
    $dados['classificacao'] = classificarSatisfacao($dados['score_geral']);
    
    // Combinar comentários
    $comentarios = [];
    if (!empty($dados['sugestoes'])) $comentarios[] = $dados['sugestoes'];
    if (!empty($dados['comentarios'])) $comentarios[] = $dados['comentarios'];
    $dados['comentarios_combinados'] = implode(' ', $comentarios);
    
    // Salvar dados
    if (!salvarCSV($dados, $csv_file)) {
        throw new Exception('Erro ao salvar dados');
    }
    
    // Registrar log de sucesso
    registrarLog("Questionário salvo com sucesso - ID: {$dados['id']}", $log_file);
    
    // Resposta de sucesso
    http_response_code(200);
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Questionário recebido com sucesso!',
        'id' => $dados['id'],
        'score_geral' => $dados['score_geral'],
        'classificacao' => $dados['classificacao']
    ]);
    
} catch (Exception $e) {
    // Registrar erro
    registrarLog("Erro: " . $e->getMessage(), $log_file);
    
    // Resposta de erro
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro interno do servidor',
        'mensagem' => 'Não foi possível processar o questionário. Tente novamente.'
    ]);
}

/**
 * Endpoint para obter estatísticas (GET)
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'stats') {
    try {
        if (!file_exists($csv_file)) {
            echo json_encode(['erro' => 'Nenhum dado encontrado']);
            exit();
        }
        
        $handle = fopen($csv_file, 'r');
        $cabecalho = fgetcsv($handle, 0, ';');
        $dados = [];
        
        while (($linha = fgetcsv($handle, 0, ';')) !== false) {
            $dados[] = array_combine($cabecalho, $linha);
        }
        fclose($handle);
        
        // Calcular estatísticas básicas
        $total = count($dados);
        $scores = array_column($dados, 'score_geral');
        $scores = array_filter($scores, 'is_numeric');
        
        $stats = [
            'total_respostas' => $total,
            'score_medio' => !empty($scores) ? round(array_sum($scores) / count($scores), 2) : 0,
            'data_relatorio' => date('Y-m-d H:i:s')
        ];
        
        // Distribuição por classificação
        $classificacoes = array_count_values(array_column($dados, 'classificacao'));
        $stats['distribuicao_classificacao'] = $classificacoes;
        
        echo json_encode($stats);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['erro' => 'Erro ao gerar estatísticas']);
    }
}
?>