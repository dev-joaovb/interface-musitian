// LinkWithReload.jsx
import React from 'react';

// O tempo deve ser igual ou maior que a duração do fade-out do Loader (500ms)
const LOADER_DURATION_MS = 400; 

function LinkWithReload({ to, children, className, ...props }) {
  
  const handleClick = (event) => {
    // Previne a navegação padrão do React Router (SPA)
    event.preventDefault();
    
    // 1. Mostra o loader global (se existir)
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