// js/temas.js - Gerenciamento de temas funcional

document.addEventListener('DOMContentLoaded', function() {
    const btnTemas = document.getElementById('btn-temas');
    const menuTemas = document.getElementById('menu-temas');
    const temaAtual = localStorage.getItem('tema') || 'claro';
    
    // Aplicar tema salvo
    aplicarTema(temaAtual);
    
    // Botão de temas - abrir/fechar menu
    if (btnTemas) {
        btnTemas.addEventListener('click', function(e) {
            e.stopPropagation();
            menuTemas.classList.toggle('mostrar');
        });
    }
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (btnTemas && menuTemas && 
            !btnTemas.contains(e.target) && 
            !menuTemas.contains(e.target)) {
            menuTemas.classList.remove('mostrar');
        }
    });
    
    // Selecionar tema
    menuTemas.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const novoTema = this.getAttribute('data-tema');
            aplicarTema(novoTema);
            menuTemas.classList.remove('mostrar');
        });
    });
    
    function aplicarTema(tema) {
        // Remover todas as classes de tema
        document.body.classList.remove('tema-claro', 'tema-escuro', 'tema-verde', 'tema-azul');
        
        // Adicionar a classe do tema selecionado
        document.body.classList.add(`tema-${tema}`);
        
        // Salvar preferência
        localStorage.setItem('tema', tema);
        
        // Feedback visual
        mostrarNotificacao(`Tema ${tema} aplicado`, 'info');
    }
    
    function mostrarNotificacao(mensagem, tipo) {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.textContent = mensagem;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.style.opacity = '0';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, 2000);
    }
});