// Sistema de Satisfação da Cantina - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionario-form');
    const anonimoCheckbox = document.getElementById('anonimo');
    const identificacaoGroup = document.getElementById('identificacao-group');
    
    // Gerenciar visibilidade da seção de identificação
    anonimoCheckbox.addEventListener('change', function() {
        if (this.checked) {
            identificacaoGroup.style.display = 'none';
            // Limpar campos quando ocultar
            document.getElementById('nome').value = '';
            document.getElementById('email').value = '';
        } else {
            identificacaoGroup.style.display = 'block';
        }
    });

    // Progress tracking
    const formSections = document.querySelectorAll('.form-section');
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    
    // Create progress bar
    createProgressBar();
    
    // Update progress as user fills the form
    requiredInputs.forEach(input => {
        input.addEventListener('change', updateProgress);
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        const errors = [];

        // Remove previous error styling
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        // Validate required fields
        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    isValid = false;
                    highlightError(input.closest('.form-group'), `Por favor, selecione uma opção para: ${getFieldLabel(input.name)}`);
                }
            } else if (!input.value.trim()) {
                isValid = false;
                highlightError(input, `Este campo é obrigatório`);
            }
        });

        // Validate email if provided
        const email = document.getElementById('email');
        if (email.value && !isValidEmail(email.value)) {
            isValid = false;
            highlightError(email, 'Por favor, insira um e-mail válido');
        }

        if (!isValid) {
            // Scroll to first error
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    function highlightError(element, message) {
        element.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (element.classList.contains('form-group')) {
            element.appendChild(errorDiv);
        } else {
            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        }
    }

    function getFieldLabel(fieldName) {
        const labels = {
            'turma': 'Turma/Série',
            'frequencia': 'Frequência de uso',
            'sabor': 'Avaliação do sabor',
            'qualidade': 'Qualidade dos alimentos',
            'variedade': 'Variedade do cardápio',
            'atendimento': 'Avaliação do atendimento',
            'tempo': 'Tempo de espera',
            'limpeza': 'Limpeza da cantina',
            'espaco': 'Espaço físico',
            'precos': 'Avaliação dos preços',
            'satisfacao': 'Satisfação geral',
            'recomendacao': 'Recomendação'
        };
        return labels[fieldName] || fieldName;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function createProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar';
        progressContainer.innerHTML = '<div class="progress-fill"></div>';
        
        const form = document.getElementById('questionario-form');
        form.insertBefore(progressContainer, form.firstChild);
    }

    function updateProgress() {
        const totalRequired = requiredInputs.length;
        let completedFields = 0;

        // Count completed required fields
        const completedInputs = new Set();
        
        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (isChecked && !completedInputs.has(input.name)) {
                    completedInputs.add(input.name);
                    completedFields++;
                }
            } else if (input.value.trim() && !completedInputs.has(input.name)) {
                completedInputs.add(input.name);
                completedFields++;
            }
        });

        const progress = (completedFields / totalRequired) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
    }

    async function submitForm() {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.innerHTML = originalText + '<span class="loading"></span>';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = collectFormData();
            
            // Here you would normally send to a server
            // For now, we'll simulate a successful submission
            await simulateSubmission(formData);
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            form.reset();
            updateProgress();
            
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert('Erro ao enviar formulário. Tente novamente.');
        } finally {
            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    function collectFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add timestamp and generate ID
        data.timestamp = new Date().toISOString();
        data.id = generateId();
        
        // Calculate satisfaction score
        data.score = calculateSatisfactionScore(data);
        
        return data;
    }

    function calculateSatisfactionScore(data) {
        const scoreFields = ['sabor', 'qualidade', 'variedade', 'atendimento', 'tempo', 'limpeza', 'espaco', 'precos', 'satisfacao'];
        let totalScore = 0;
        let fieldCount = 0;
        
        scoreFields.forEach(field => {
            if (data[field]) {
                totalScore += parseInt(data[field]);
                fieldCount++;
            }
        });
        
        return fieldCount > 0 ? (totalScore / fieldCount).toFixed(2) : 0;
    }

    function generateId() {
        return 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async function simulateSubmission(data) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store in localStorage for demonstration
        const evaluations = JSON.parse(localStorage.getItem('cantina_evaluations') || '[]');
        evaluations.push(data);
        localStorage.setItem('cantina_evaluations', JSON.stringify(evaluations));
        
        console.log('Avaliação enviada:', data);
    }

    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <h3>✅ Obrigado pela sua avaliação!</h3>
            <p>Sua opinião é muito importante para melhorarmos nossos serviços.</p>
            <p>Os dados foram registrados com sucesso.</p>
        `;
        
        // Insert success message at the top of the form
        form.insertBefore(successDiv, form.firstChild);
        
        // Scroll to top to show success message
        successDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Remove success message after 10 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 10000);
    }

    // Enhanced user experience features
    
    // Save form data to localStorage as user types (auto-save)
    const autoSaveInputs = document.querySelectorAll('input, select, textarea');
    autoSaveInputs.forEach(input => {
        input.addEventListener('input', debounce(autoSave, 1000));
    });

    function autoSave() {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        localStorage.setItem('cantina_form_draft', JSON.stringify(data));
    }

    // Load saved data on page load
    function loadSavedData() {
        const savedData = localStorage.getItem('cantina_form_draft');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'radio') {
                        const radioButton = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radioButton) radioButton.checked = true;
                    } else if (input.type === 'checkbox') {
                        input.checked = data[key] === 'on';
                    } else {
                        input.value = data[key];
                    }
                }
            });
            updateProgress();
        }
    }

    // Clear saved data after successful submission
    function clearSavedData() {
        localStorage.removeItem('cantina_form_draft');
    }

    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize
    loadSavedData();
    updateProgress();

    // Add smooth scrolling to sections
    const sectionHeaders = document.querySelectorAll('.form-section h2');
    sectionHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            this.parentElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (validateForm()) {
                submitForm();
            }
        }
    });

    // Clear saved data when form is successfully submitted
    form.addEventListener('submit', function() {
        if (validateForm()) {
            setTimeout(clearSavedData, 2000);
        }
    });
});

// Export evaluation data functionality (for admin use)
function exportEvaluations() {
    const evaluations = JSON.parse(localStorage.getItem('cantina_evaluations') || '[]');
    if (evaluations.length === 0) {
        alert('Não há avaliações para exportar');
        return;
    }
    
    const csvContent = convertToCSV(evaluations);
    downloadCSV(csvContent, 'avaliacoes_cantina.csv');
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(';'));
    
    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains special characters
            return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(';'));
    });
    
    return csvRows.join('\n');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}