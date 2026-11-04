const clientForm = document.getElementById('clientForm');
const clientIdInput = document.getElementById('clientId');
const nomeInput = document.getElementById('nome');
const cpfInput = document.getElementById('cpf');
const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const tituloForm = document.getElementById('titulo-form');
const clientTableBody = document.getElementById('clientTableBody');
const clientCount = document.getElementById('clientCount');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const confirmDialog = document.getElementById('confirmDialog');
const confirmCancel = document.getElementById('confirmCancel');
const confirmDelete = document.getElementById('confirmDelete');
const clientDialog = document.getElementById('clientDialog');
const newClientBtn = document.getElementById('newClientBtn');
const closeClientDialog = document.getElementById('closeClientDialog');

let clients = JSON.parse(localStorage.getItem('crm_clients')) || [];
let indexParaExcluir = null;

// Mascaras de input (UX)
cpfInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d)/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    }
    e.target.value = value;
});

telefoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
        // celular completo: (11) 98765-4321
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
        // fixo, ou celular ainda sendo digitado: (11) 3333-4444
        value = value.replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3');
    } else if (value.length > 2) {
        // só DDD + começo do número: (11) 9876
        value = value.replace(/^(\d{2})(\d+)$/, '($1) $2');
    }
    e.target.value = value;
});

[nomeInput, cpfInput, emailInput, telefoneInput].forEach(input => {
    input.addEventListener('input', () => {
        const errorElement = document.getElementById(`erro-${input.id}`);
        if (errorElement) errorElement.innerText = '';
    });
});

// Algoritmo oficial de validacao do digito verificador do CPF
function testarCPFValido(strCPF) {
    let soma = 0;
    let resto;
    let cpfLimpo = strCPF.replace(/\D/g, '');

    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
}

// Verifica se o CPF ja pertence a outro cliente (na edicao, ignora o proprio cliente)
function cpfJaCadastrado(cpf, idAtual) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return clients.some(c => c.id !== idAtual && c.cpf.replace(/\D/g, '') === cpfLimpo);
}

// Formato nome@dominio.ext: sem espacos, um unico @ e dominio com ponto e extensao de 2+ letras
function emailValido(email) {
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(email);
}

function validarFormulario() {
    let isValid = true;

    if (nomeInput.value.trim().length < 3) {
        document.getElementById('erro-nome').innerText = 'O nome deve ter no mínimo 3 caracteres.';
        isValid = false;
    }
    if (cpfInput.value.length < 14) {
        document.getElementById('erro-cpf').innerText = 'Digite o CPF completo.';
        isValid = false;
    } else if (!testarCPFValido(cpfInput.value)) {
        document.getElementById('erro-cpf').innerText = 'Este CPF é inválido. Digite um documento real.';
        isValid = false;
    } else if (cpfJaCadastrado(cpfInput.value, clientIdInput.value)) {
        document.getElementById('erro-cpf').innerText = 'Já existe um cliente cadastrado com este CPF.';
        isValid = false;
    } else {
        document.getElementById('erro-cpf').innerText = '';
    }
    if (!emailValido(emailInput.value.trim())) {
        document.getElementById('erro-email').innerText = 'Digite um e-mail válido, no formato nome@dominio.com.';
        isValid = false;
    }
    if (telefoneInput.value.length < 14) {
        document.getElementById('erro-telefone').innerText = 'Digite um telefone válido com DDD.';
        isValid = false;
    }

    return isValid;
}

clientForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
        showToast('Por favor, corrija os erros no formulário.', 'error');
        return;
    }

    const clientData = {
        id: clientIdInput.value || Date.now().toString(),
        nome: nomeInput.value.trim(),
        cpf: cpfInput.value,
        email: emailInput.value.trim(),
        telefone: telefoneInput.value
    };

    const idAtual = clientIdInput.value;

    if (idAtual === '') {
        clients.push(clientData);
        showToast('Cliente cadastrado com sucesso!', 'success');
    } else {
        const index = clients.findIndex(c => c.id === idAtual);
        if (index !== -1) {
            clients[index] = clientData;
            showToast('Dados do cliente atualizados!', 'success');
        }
    }

    salvarEAtualizarTELA();
    fecharModalCliente();
});

// Modal de cadastro/edicao de cliente
function abrirModalCliente() {
    clientDialog.showModal();
    nomeInput.focus();
}

function fecharModalCliente() {
    clientDialog.close();
}

newClientBtn.addEventListener('click', () => {
    resetarFormulario();
    abrirModalCliente();
});

closeClientDialog.addEventListener('click', fecharModalCliente);

// Limpa o formulario sempre que o modal fecha (botao X, tecla Esc ou apos salvar)
clientDialog.addEventListener('close', resetarFormulario);

// Fecha o modal ao clicar fora dele (no fundo escurecido)
clientDialog.addEventListener('click', (e) => {
    if (e.target === clientDialog) fecharModalCliente();
});

function renderTable(listaParaExibir = clients) {
    clientTableBody.innerHTML = '';
    clientCount.innerText = `${listaParaExibir.length} ${listaParaExibir.length === 1 ? 'cliente' : 'clientes'}`;

    if (listaParaExibir.length === 0) {
        emptyState.hidden = false;
    } else {
        emptyState.hidden = true;

        listaParaExibir.forEach((client) => {
            const indiceOriginal = clients.findIndex(c => c.id === client.id);
            
            const tr = document.createElement('tr');

            // textContent evita que dados digitados sejam interpretados como HTML
            [
                ['Nome', client.nome],
                ['CPF', client.cpf],
                ['E-mail', client.email],
                ['Telefone', client.telefone]
            ].forEach(([rotulo, valor]) => {
                const td = document.createElement('td');
                td.dataset.label = rotulo;
                td.textContent = valor;
                tr.appendChild(td);
            });

            const tdAcoes = document.createElement('td');
            tdAcoes.dataset.label = 'Ações';
            tdAcoes.className = 'client-actions';

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-edit';
            btnEditar.textContent = 'Editar';
            btnEditar.setAttribute('aria-label', `Editar ${client.nome}`);
            btnEditar.addEventListener('click', () => prepararEdicao(indiceOriginal));

            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn-delete';
            btnExcluir.textContent = 'Excluir';
            btnExcluir.setAttribute('aria-label', `Excluir ${client.nome}`);
            btnExcluir.addEventListener('click', () => abrirModalExclusao(indiceOriginal));

            tdAcoes.append(btnEditar, btnExcluir);
            tr.appendChild(tdAcoes);
            clientTableBody.appendChild(tr);
        });
    }
}

function salvarEAtualizarTELA() {
    localStorage.setItem('crm_clients', JSON.stringify(clients));
    renderTable();
}

window.prepararEdicao = function(index) {
    const client = clients[index];
    
    clientIdInput.value = client.id;
    nomeInput.value = client.nome;
    cpfInput.value = client.cpf;
    emailInput.value = client.email;
    telefoneInput.value = client.telefone;

    tituloForm.innerText = "Editar Dados do Cliente";
    submitBtn.innerText = "Atualizar cliente";
    cancelEditBtn.hidden = false;

    abrirModalCliente();
};

cancelEditBtn.addEventListener('click', fecharModalCliente);

function resetarFormulario() {
    clientForm.reset();
    clientIdInput.value = '';
    tituloForm.innerText = "Cadastrar Novo Cliente";
    submitBtn.innerText = "Salvar cliente";
    cancelEditBtn.hidden = true;
    
    [nomeInput, cpfInput, emailInput, telefoneInput].forEach(input => {
        const errorElement = document.getElementById(`erro-${input.id}`);
        if (errorElement) errorElement.innerText = '';
    });
}

window.abrirModalExclusao = function(index) {
    indexParaExcluir = index;
    confirmDialog.showModal();
};

confirmCancel.addEventListener('click', () => {
    confirmDialog.close();
    indexParaExcluir = null;
});

confirmDelete.addEventListener('click', () => {
    if (indexParaExcluir !== null) {
        clients.splice(indexParaExcluir, 1);
        salvarEAtualizarTELA();
        showToast('Cliente removido da base.', 'success');
        if (clientIdInput.value !== '') resetarFormulario();
        confirmDialog.close();
        indexParaExcluir = null;
    }
});

// Filtro de busca em tempo real
searchInput.addEventListener('input', (e) => {
    const termoBusca = e.target.value.toLowerCase();
    const filtrados = clients.filter(client => 
        client.nome.toLowerCase().includes(termoBusca) || 
        client.cpf.includes(termoBusca) ||
        client.email.toLowerCase().includes(termoBusca)
    );
    renderTable(filtrados);
});

function showToast(mensagem, tipo) {
    toast.innerText = mensagem;
    toast.className = `toast ${tipo}`;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3000);
}

renderTable();
