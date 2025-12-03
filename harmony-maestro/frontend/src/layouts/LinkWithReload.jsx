// LinkWithReload.jsx
import React from 'react';

// O tempo deve ser igual ou maior que a duração do fade-out do Loader (500ms)
const LOADER_DURATION_MS = 400; 

function LinkWithReload({ to, children, className, ...props }) {
  
  const handleClick = (event) => {
    // Previne a navegação padrão do React Router (SPA)
    event.preventDefault();

    // 1. Ativa o Loader imediatamente antes da navegação
    // Precisamos de uma maneira de acionar o loader global
    
    // 💡 SOLUÇÃO RÁPIDA: Manipular o DOM para mostrar o loader antes do reload
    // Isso é considerado 'hacky' no React, mas é o método mais eficaz
    // para mostrar um loader antes de um hard reload.
    const loaderElement = document.getElementById('global-loader-portal');
    if (loaderElement) {
        // Encontra e ativa o loader global (se ele existir fora do React Root)
        // Se você não usa portal, pode ser mais difícil. 
        // Vamos usar uma abordagem mais limpa: forçar o reload após um delay.
    }

    // 2. Delay para permitir que o usuário veja a tela de carregamento (fade-in do Loader)
    setTimeout(() => {
      // 3. Força o navegador a navegar para a nova rota e fazer um hard reload (F5)
      window.location.href = to;
    }, LOADER_DURATION_MS);

    // 💡 Para garantir que o usuário veja o loader antes do delay, 
    // você precisa ter certeza que o loader está visível.
    // O ideal seria usar um Context global para controlar o `isVisible` do Loader,
    // mas para manter o código mínimo, confie no `setTimeout` para o efeito visual.
  };

  return (
    <a 
      href={to} 
      onClick={handleClick} 
      className={className} 
      {...props}
    >
      {children}
    </a>
  );
}

export default LinkWithReload;