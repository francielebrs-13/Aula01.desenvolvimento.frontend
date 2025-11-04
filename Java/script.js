document.addEventListener("DOMContentLoaded", () => {
    aplicarMascaras();
    ativarValidacao();
    ativarFuncionalidades();
});


// ===================================
// 1. MÁSCARAS DE INPUT (REQUISITO PRINCIPAL)
// ===================================

function maskCEP(value) {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    return value;
}

function maskCPF(value) {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
}

function maskTelefone(value) {
    if (!value) return "";
    value = value.replace(/\D/g, "");


    value = value.substring(0, 11);

    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");


    if (value.length > 14) {
        value = value.replace(/(\d{5})(\d{4})$/, "$1-$2");
    } else {
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

    if (id === "nascimento" && valor) {
        const dataNascimento = new Date(valor);
        const hoje = new Date();
        const idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const mes = hoje.getMonth() - dataNascimento.getMonth();
        const dia = hoje.getDate() - dataNascimento.getDate();

        if (idade < 18 || (idade === 18 && (mes < 0 || (mes === 0 && dia < 0)))) {
            erro = "Você deve ter pelo menos 18 anos para se cadastrar como voluntário.";
        }
    }

    if (id === "cpf" && valor && valor.replace(/\D/g, "").length !== 11) {
        erro = "O CPF deve estar completo (11 dígitos).";
    }

    if (id === "telefone" && valor && valor.replace(/\D/g, "").length < 10) {
        erro = "O Telefone deve ter pelo menos 10 dígitos (DDD + número).";
    }

    return erro;
}

function exibirErro(campo, mensagem) {
    let divErro = campo.nextElementSibling;
    if (divErro && divErro.classList.contains('erro-validacao')) {
        divErro.remove();
    }
    campo.classList.remove('input-erro');

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
            let erro = campo.validationMessage;
            if (erro) {
            } else {
                erro = checarConsistencia(campo);
            }

            if (exibirErro(campo, erro)) {
                todosValidos = false;
            }
        });

        const mensagemFinal = document.getElementById("mensagem");

        if (todosValidos) {
            mensagemFinal.textContent = "Cadastro enviado com sucesso! Entraremos em contato em breve.";
            mensagemFinal.style.color = 'green';
            form.reset(); 
        } else {
            mensagemFinal.textContent = "Por favor, corrija os erros nos campos antes de enviar.";
            mensagemFinal.style.color = 'var(--cor-alerta)';
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