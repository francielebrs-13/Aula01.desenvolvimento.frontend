document.addEventListener("DOMContentLoaded", () => {
    aplicarMascaras();
    ativarValidacao();
    ativarFuncionalidades(); // <--- Novo: Ativa Menu e Contraste
});


// ===================================
// 1. MÁSCARAS DE INPUT (REQUISITO PRINCIPAL)
// ===================================

function maskCEP(value) {
    if (!value) return "";
    value = value.replace(/\D/g, ""); // Remove tudo que não for dígito
    value = value.replace(/^(\d{5})(\d)/, "$1-$2"); // Coloca hífen na quinta posição
    return value;
}

function maskCPF(value) {
    if (!value) return "";
    value = value.replace(/\D/g, ""); // Remove tudo que não for dígito
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
}

function maskTelefone(value) {
    if (!value) return "";
    value = value.replace(/\D/g, ""); // 1. Remove tudo que não for dígito
    
    // Limita para 11 dígitos no máximo (padrão brasileiro)
    value = value.substring(0, 11);
    
    // 2. Coloca os parênteses no DDD: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");

    // 3. Aplica o hífen de acordo com o tamanho
    if (value.length > 14) { // Se tiver 11 dígitos numéricos (celular com 9)
        // (XX) 9XXXX-XXXX
        value = value.replace(/(\d{5})(\d{4})$/, "$1-$2");
    } else { // Se tiver 10 ou 9 dígitos numéricos (celular sem 9, ou fixo)
        // (XX) XXXX-XXXX
        value = value.replace(/(\d{4})(\d{4})$/, "$1-$2");
    }
    
    return value;
}
function aplicarMascaras() {
    const cpfInput = document.getElementById("cpf");
    const telefoneInput = document.getElementById("telefone");
    const cepInput = document.getElementById("cep");

    if (cpfInput) {
        cpfInput.addEventListener("input", (e) => {
            e.target.value = maskCPF(e.target.value);
        });
    }
    if (telefoneInput) {
        telefoneInput.addEventListener("input", (e) => {
            e.target.value = maskTelefone(e.target.value);
        });
    }
    if (cepInput) {
        cepInput.addEventListener("input", (e) => {
            e.target.value = maskCEP(e.target.value);
        });
    }
}


// ===================================
// 2. CONSISTÊNCIA E VALIDAÇÃO DE DADOS
// ===================================

function checarConsistencia(campo) {
    const id = campo.id;
    const valor = campo.value.trim();
    let erro = "";

    // Checagem de Consistência: Maioridade (REQUISITO)
    if (id === "nascimento" && valor) {
        const dataNascimento = new Date(valor);
        const hoje = new Date();
        const idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const mes = hoje.getMonth() - dataNascimento.getMonth();
        const dia = hoje.getDate() - dataNascimento.getDate();

        // Checagem se a idade é menor que 18
        if (idade < 18 || (idade === 18 && (mes < 0 || (mes === 0 && dia < 0)))) {
            erro = "Você deve ter pelo menos 18 anos para se cadastrar como voluntário.";
        }
    }

    // Checagem de Consistência: CPF Completo (11 dígitos, excluindo pontos/hífens)
    if (id === "cpf" && valor && valor.replace(/\D/g, "").length !== 11) {
        erro = "O CPF deve estar completo (11 dígitos).";
    }

    // Checagem de Consistência: Telefone Completo (mínimo 10 dígitos, DDD + 8/9 dígitos)
    if (id === "telefone" && valor && valor.replace(/\D/g, "").length < 10) {
        erro = "O Telefone deve ter pelo menos 10 dígitos (DDD + número).";
    }

    return erro;
}

function exibirErro(campo, mensagem) {
    // Remove o erro anterior
    let divErro = campo.nextElementSibling;
    if (divErro && divErro.classList.contains('erro-validacao')) {
        divErro.remove();
    }
    campo.classList.remove('input-erro');

    // Se houver mensagem, exibe o novo erro
    if (mensagem) {
        divErro = document.createElement('div');
        divErro.classList.add('erro-validacao');
        divErro.style.color = 'var(--cor-alerta)';
        divErro.style.marginTop = '0.5rem';
        divErro.textContent = mensagem;
        campo.after(divErro);
        campo.classList.add('input-erro');
        return true;
    }
    return false;
}

function ativarValidacao() {
    const form = document.getElementById("formCadastro");
    if (!form) return;

    // Adiciona validação em tempo real ao perder o foco (blur)
    Array.from(form.querySelectorAll("input, select, textarea")).forEach(campo => {
        campo.addEventListener('blur', () => {
            const erro = checarConsistencia(campo);
            exibirErro(campo, erro);
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const campos = Array.from(form.querySelectorAll("input, select, textarea"));
        let todosValidos = true;

        campos.forEach(campo => {
            // 1. Validação nativa (required, type="email", etc.)
            let erro = campo.validationMessage;
            if (erro) {
                // Se a validação nativa falhar, usa a mensagem do navegador (ou personaliza)
            } else {
                // 2. Validação de Consistência (customizada)
                erro = checarConsistencia(campo);
            }

            if (exibirErro(campo, erro)) {
                todosValidos = false;
            }
        });

        const mensagemFinal = document.getElementById("mensagem");

        if (todosValidos) {
            // Se tudo estiver OK, envia o formulário e exibe a mensagem de sucesso
            mensagemFinal.textContent = "Cadastro enviado com sucesso! Entraremos em contato em breve.";
            mensagemFinal.style.color = 'green';
            form.reset(); // Limpa o formulário
        } else {
            mensagemFinal.textContent = "Por favor, corrija os erros nos campos antes de enviar.";
            mensagemFinal.style.color = 'var(--cor-alerta)';
            // Rola a tela para o primeiro erro
            const primeiroErro = form.querySelector('.input-erro');
            if (primeiroErro) {
                primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}


// ===================================
// 3. MENU HAMBÚRGUER E MODO ALTO CONTRASTE (NOVAS FUNÇÕES)
// ===================================

function ativarFuncionalidades() {
    const btnContraste = document.getElementById("btn-contraste");
    const btnHamburguer = document.getElementById("hamburguer");
    const navMenu = document.querySelector("header nav");

    // Ativa / Desativa Modo Alto Contraste
    if (btnContraste) {
        btnContraste.addEventListener("click", () => {
            document.body.classList.toggle("modo-escuro");
            // Salva a preferência do usuário (melhora UX)
            const isEscuro = document.body.classList.contains("modo-escuro");
            localStorage.setItem("modo-escuro", isEscuro ? "ativado" : "desativado");
            btnContraste.setAttribute("aria-pressed", isEscuro);
        });

        // Carrega a preferência ao iniciar
        if (localStorage.getItem("modo-escuro") === "ativado") {
            document.body.classList.add("modo-escuro");
            btnContraste.setAttribute("aria-pressed", true);
        } else {
            btnContraste.setAttribute("aria-pressed", false);
        }
    }

    // Ativa / Desativa Menu Hambúrguer
    if (btnHamburguer && navMenu) {
        btnHamburguer.addEventListener("click", () => {
            // Toggle da classe CSS para mostrar/esconder o menu (no CSS)
            navMenu.classList.toggle("menu-aberto");

            // Atualiza o estado de acessibilidade
            const isAberto = navMenu.classList.contains("menu-aberto");
            btnHamburguer.setAttribute("aria-expanded", isAberto);
        });
    }
}