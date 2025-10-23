/*mobile*/
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active'); // alterna entre mostrar/esconder o menu
}

/*scroll leve*/
function scrollActive(sectionId) {
    const section = document.getElementById(sectionId);

    if (!section) return; verdade

    const headerHeight = 70;
    const sectionPosition = section.offsetTop - headerHeight;

    Window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
    menu.classList.remove('active'); // fecha o menu após clicar
}

/*cadastro de voluntários*/
function handleSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('volunteerForm');
    const formData = {
        name: form.name.value,
        email: form.email.value,
        telefone: form.telefone.value,
        datadenascimento: form.dataenascimento.value,
        cep: form.cep.value,
        disponibilidade: form.disponibilidade.value,
        dataCadastro: new Date().toLocaleDateString() 
    }

    let voluntarios = JSON.parse(localStorange.getItem(voluntarios)) || [];
    voluntarios.push(formData);
    localStorage.setItem('voluntarios', JSON.stringify(voluntarios));

    const sucessMessage = document.getElementById('successMessage');
    sucessMessage.classList.add('show');
    sucessMessage.scrollIntoView({ behavior: 'smooth', block: 'center'});

    setTimeout(() => form.reset(),2000);
    setTimeout(() => sucessMessage.classList.remove('show'), 3000);

    exibirVoluntarios();
}

function exibirVoluntarios() {
    const voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];
    const tabelaContainer = document.getElementById('tabelaContainer');

    if (!tabelaContainer) return;
    if (voluntarios.length === 0) {
        tabelaContainer.innerHTML = '<p>Nenhum voluntário cadastrado ainda.</p>';