import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Music,
  FileText,
  Users,
  ListOrdered,
  UserPlus,
  Bell,
  Code,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';

// =========================================================================
// Componente de Fundo Parallax (Requer CSS Externo)
// =========================================================================

/**
 * Componente Div que simula o fundo Parallax.
 * 🚨 REQUER QUE A CLASSE CSS EXTERNA (ex: .bg-hero-parallax) TENHA:
 * {
 * background-image: url('caminho-da-sua-imagem');
 * background-attachment: fixed;
 * background-size: cover;
 * background-position: center;
 * }
 */
const ParallaxBackground = ({ children, className }) => (
  <div className={`relative min-h-[50vh] flex items-center justify-center bg-cover bg-fixed bg-center ${className}`}>
    {/* Overlay para contraste */}
    <div className="absolute inset-0 bg-black opacity-60"></div>
    <div className="relative z-10 w-full">{children}</div>
  </div>
);

// =========================================================================
// Componente Principal
// =========================================================================

export default function LandingPage() {

  // 🆕 Estado para monitorar se a rolagem ultrapassou o topo
  const [isScrolled, setIsScrolled] = useState(false);

  // 🆕 Lógica para atualizar o estado de rolagem
  useEffect(() => {
    const handleScroll = () => {
      // Define o ponto de gatilho (ex: 50 pixels de rolagem)
      const shouldBeScrolled = window.scrollY > 50;
      if (shouldBeScrolled !== isScrolled) {
        setIsScrolled(shouldBeScrolled);
      }
    };

    // Adiciona o listener
    window.addEventListener('scroll', handleScroll);

    // Limpeza: remove o listener ao desmontar o componente
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolled]); // O [isScrolled] evita que a função handleScroll seja recriada em todo render.

  const navItems = [
    { href: '#inicio', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#funcionalidades', label: 'Funcionalidades' },
    { href: '#desenvolvimento', label: 'Valores' },
    { href: '#telas', label: 'Telas' },
    { href: '#contato', label: 'Contato' },
    { href: '#duvidas', label: 'Dúvidas' },
  ];

  // 1. Primeiro, vamos garantir que a lista de funcionalidades tenha o caminho da imagem correspondente
  const featuresList = [
    { title: "Dashboard", icon: LayoutDashboard, description: "Visualização de atividades, membros e relatórios.", image: "./telas/outros/tela_frontal.svg" },
    { title: "Calendário", icon: Calendar, description: "Agende eventos e compromissos importantes do grupo.", image: "./telas/outros/tela_frontal_calendario.svg" },
    { title: "Biblioteca", icon: Music, description: "Acervo musical para upload de músicas e organização.", image: "./telas/outros/tela_frontal_biblioteca.svg" },
    { title: "Partituras", icon: FileText, description: "Upload e organização de partituras em PDF por autor.", image: "./telas/outros/tela_frontal_partituras.svg" },
    { title: "Séries de Ensaio", icon: Users, description: "Agendamento de ensaios com lista de presença e chat.", image: "./telas/outros/tela_frontal_series.svg" },
    { title: "Escalas", icon: ListOrdered, description: "Gerenciamento de escalas com rodízio automático.", image: "./telas/outros/tela_frontal_escalas.svg" },
    { title: "Membros", icon: UserPlus, description: "Gestão de músicos e convites do administrador.", image: "./telas/outros/tela_frontal_membros.svg" },
    { title: "Notificações", icon: Bell, description: "Lembretes e novidades relevantes para o engajamento.", image: "./telas/outros/tela_frontal_notificacoes.svg" },
  ];

  // 2. Estado para controlar qual funcionalidade está ativa (Inicia com a primeira: Dashboard)
  const [activeFeature, setActiveFeature] = useState(featuresList[0]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Atualize a função de clique para resetar o carregamento
  const handleFeatureChange = (feat) => {
    if (feat.title !== activeFeature.title) {
      setIsImageLoaded(false); // Reseta para a próxima imagem começar invisível
      setActiveFeature(feat);
    }
  };

  // 🆕 Lista de Telas para o Carrossel (MÁXIMO 10)
  const screens = [

    // Dashboard
    { src: "./telas/dashboard/tela 1.svg", alt: "Tela do Dashboard" },
    { src: "./telas/dashboard/tela 2.svg", alt: "Tela do Dashboard" },
    { src: "./telas/dashboard/tela 3.svg", alt: "Tela do Dashboard" },
    { src: "./telas/dashboard/tela 4.svg", alt: "Tela do Dashboard" },

    // Calendario
    { src: "./telas/calendario/tela 1.svg", alt: "Tela de Calendário" },
    { src: "./telas/calendario/tela 2.svg", alt: "Tela de Calendário" },
    { src: "./telas/calendario/tela 3.svg", alt: "Tela de Calendário" },

    // Biblioteca
    { src: "./telas/biblioteca/tela 1.svg", alt: "Tela da Biblioteca Musical" },
    { src: "./telas/biblioteca/tela 2.svg", alt: "Tela da Biblioteca Musical" },
    { src: "./telas/biblioteca/tela 3.svg", alt: "Tela da Biblioteca Musical" },

    // Partitura
    { src: "./telas/partituras/tela 1.svg", alt: "Tela de Partituras" },
    { src: "./telas/partituras/tela 2.svg", alt: "Tela de Partituras" },

    // Série de Ensaio
    { src: "/img/screens/dashboard.png", alt: "Tela do Dashboard" },
    { src: "/img/screens/calendar.png", alt: "Tela do Calendário" },
    { src: "/img/screens/biblioteca.png", alt: "Tela da Biblioteca Musical" },
    { src: "/img/screens/partitura.png", alt: "Tela de Partituras" },
    { src: "/img/screens/series.png", alt: "Tela de Séries de Ensaio" },
    { src: "/img/screens/escalas.png", alt: "Tela de Escalas Automáticas" },

    // Escalas
    { src: "/img/screens/membros.png", alt: "Tela de Gestão de Membros" },
    { src: "/img/screens/notificacoes.png", alt: "Tela de Notificações" },

    // Membros
    { src: "/img/screens/configuracoes.png", alt: "Tela de Configurações" },
    { src: "/img/screens/login.png", alt: "Tela de Login" }, // Tela 20
    
    // Notificações
    { src: "/img/screens/configuracoes.png", alt: "Tela de Configurações" },


    // Se você precisar de menos, remova as últimas, mas aqui está o limite de 10.
  ];
  
  // 🆕 Estado para controlar o índice da tela atual
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const totalScreens = screens.length;

  // 🆕 Funções de Navegação
  const nextScreen = () => {
    setCurrentScreenIndex((prevIndex) => 
      (prevIndex + 1) % totalScreens // Volta para 0 após a última
    );
  };

  const prevScreen = () => {
    setCurrentScreenIndex((prevIndex) => 
      (prevIndex - 1 + totalScreens) % totalScreens // Volta para a última após a primeira
    );
  };

  return (
    <div className="font-sans text-black antialiased">

      {/* ===================================================================
          # HEADER
      =================================================================== */}
      <header className={`fixed w-full z-30 transition-all duration-500 ease-in-out 
          ${isScrolled 
            ? 'bg-white/80 shadow-lg backdrop-blur-md py-2' 
            : 'bg-white/5 py-4'
          }`
      }>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Dinâmico */}
            <div className="flex-shrink-0 transition-all duration-300">
              <a href="#inicio" className="flex items-center">
                <img
                  // Troca a imagem baseada no scroll
                  src={isScrolled ? "/logo-light.svg" : "/logo-dark.svg"}
                  alt="Harmony Maestro"
                  className="h-18 w-auto transition-opacity duration-300"
                />
              </a>
            </div>

            {/* Navegação (Desktop) */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  // Troca a cor do texto: Branco no topo, Cinza escuro após scroll
                  className={`transition-colors duration-300 font-medium ${
                    isScrolled 
                      ? 'text-gray-800 hover:text-teal-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Botão de Ação */}
            <div className="hidden md:block">
              <a
                href="/login"
                className={`inline-flex items-center justify-center px-6 py-2.5 border-2 text-sm font-bold rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'bg-teal-600 border-teal-600 text-white hover:bg-teal-700 shadow-md'
                    : 'bg-white/10 border-white text-white hover:bg-white hover:text-teal-600'
                }`}
              >
                Acessar Sistema
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================================
        # SEÇÃO TÍTULO (HERO) - PARALLAX 1
        =================================================================== */}
      <section id="inicio" className="">
        <ParallaxBackground className="bg-hero-parallax">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col md:flex-row items-center gap-12">
            
            {/* LADO ESQUERDO: Texto e Botões */}
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 mt-10">
                Harmony Maestro: Faça gestão da sua banda
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-10">
                A plataforma definitiva para líderes de banda e músicos organizarem ensaios, escalas e repertórios com foco total no desempenho e compromisso.
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-teal-600 bg-white hover:bg-gray-100 transition duration-150"
                >
                  Começar Agora
                </a>
                <a
                  href="#funcionalidades"
                  className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-full text-white hover:bg-teal-600/20 transition duration-150"
                >
                  Ver Funcionalidades
                </a>
              </div>
            </div>

            {/* LADO DIREITO: Espaço para Imagem */}
            <div className="md:w-1/2 w-full flex justify-center items-center">
              <div className="relative w-full max-w-md md:max-w-full">
                {/* Mockup de exemplo ou sua imagem real */}
                <img
                  src="./telas/outros/telaEmComputador.svg" // Substitua pelo caminho da sua imagem
                  alt="Interface Harmony Maestro"
                  className="w-full h-auto rounded-2xl transform md:rotate-2 hover:rotate-0 transition-transform duration-500"
                />
                
                {/* Efeito visual opcional: Um brilho atrás da imagem */}
                <div className="absolute -inset-4 bg-teal-500/20 blur-3xl rounded-full -z-10"></div>
              </div>
            </div>

          </div>
        </ParallaxBackground>
      </section>


      {/* ===================================================================
        # SEGUNDA SEÇÃO - SOBRE
        =================================================================== */}
      <section id="sobre" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-black mb-4">
              Organize o seu grupo com maestria
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Chega de planilhas desorganizadas e comunicação perdida no WhatsApp. O Harmony Maestro centraliza a logística e a comunicação, permitindo que você gaste mais tempo tocando e menos tempo gerenciando.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {/* Bloco 1: Centralização */}
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <div className="flex justify-center mb-4">
                <img src="/placeholder-centralizacao.svg" alt="Centralização" className="h-20 w-auto" />
              </div>
              <h3 className="text-xl font-bold text-teal-600 mb-2">Comunicação Centralizada</h3>
              <p className="text-gray-600">
                Todo o histórico de ensaios, presenças e repertório em um só lugar, tornando a transição de líderes ou a integração de novos membros rápida e transparente.
              </p>
            </div>

            {/* Bloco 2: Escalas Inteligentes */}
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <div className="flex justify-center mb-4">
                <img src="/placeholder-escalas.svg" alt="Escalas" className="h-20 w-auto" />
              </div>
              <h3 className="text-xl font-bold text-teal-600 mb-2">Escalas com Rodízio Automático</h3>
              <p className="text-gray-600">
                Gere escalas semanais de forma automática, garantindo um rodízio justo entre todos os músicos e reduzindo drasticamente o trabalho manual do administrador.
              </p>
            </div>

            {/* Bloco 3: Responsividade (Em Destaque) */}
            <div className="p-6 bg-teal-600 text-white rounded-xl shadow-2xl transform scale-105">
              <div className="flex justify-center mb-4">
                <img src="/placeholder-responsivo.svg" alt="Responsividade" className="h-20 w-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Tudo na Palma da Mão</h3>
              <p className="text-teal-100">
                **Nosso sistema é totalmente Web Responsivo.** Acesse o calendário, confirme presença e confira as partituras em qualquer dispositivo—seja desktop, tablet ou celular—sem a necessidade de instalar um aplicativo.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================================
          # TERCEIRA SEÇÃO - FUNCIONALIDADES - PARALLAX 2
      =================================================================== */}
      <section id="funcionalidades">
      <ParallaxBackground className="bg-features-parallax">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Funcionalidades</h2>
            <p className="text-xl text-gray-200 max-w-4xl mx-auto">
              Clique nos títulos para visualizar cada tela do sistema.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-4">
            
            {/* Grupo A: Esquerda */}
            <div className="w-full md:w-[20%] space-y-10 order-2 md:order-1">
              {featuresList.slice(0, 4).map((feat, index) => (
                <div 
                  key={index} 
                  onClick={() => handleFeatureChange(feat)} // Altera a imagem ao clicar
                  className={`flex flex-col items-end text-right group cursor-pointer transition-all duration-300 ${activeFeature.title === feat.title ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
                >
                  <div className="flex items-center mb-3">
                    <h4 className={`text-lg lg:text-xl font-bold mr-3 transition-colors ${activeFeature.title === feat.title ? 'text-teal-400' : 'text-white'}`}>
                      {feat.title}
                    </h4>
                    <div className={`p-2 rounded-full shadow-lg shrink-0 transition-colors ${activeFeature.title === feat.title ? 'bg-teal-600' : 'bg-white'}`}>
                      <feat.icon className={`w-5 h-5 ${activeFeature.title === feat.title ? 'text-white' : 'text-teal-600'}`} />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>

            {/* Imagem Central Dinâmica - 60% */}
            <div className="w-full md:w-[55%] flex justify-center order-1 md:order-2 mb-12 md:mb-0">
              <div className="relative w-full max-w-2xl lg:max-w-5xl px-4 transition-all duration-500">
                <div className="absolute -inset-10 bg-teal-500/10 blur-3xl rounded-full"></div>
                
                <div className="relative bg-gray-900/40 p-2 lg:p-3 rounded-[2rem] border-2 border-teal-600/20 shadow-2xl backdrop-blur-sm">
                  {/* Loader simples opcional enquanto a imagem não carrega */}
                  {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  <img
                    key={activeFeature.image}
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    onLoad={() => setIsImageLoaded(true)} // Só ativa quando o arquivo carregar
                    className={`w-full h-auto rounded-[1.8rem] shadow-2xl transition-all duration-700 ease-in-out ${
                      isImageLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-md'
                    }`}
                  />
                  
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-8 py-2.5 rounded-full text-sm font-black shadow-2xl tracking-widest uppercase">
                    Módulo: {activeFeature.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Grupo B: Direita */}
            <div className="w-full md:w-[20%] space-y-10 order-3">
              {featuresList.slice(4, 8).map((feat, index) => (
                <div 
                  key={index + 4} 
                  onClick={() => handleFeatureChange(feat)} // Altera a imagem ao clicar
                  className={`flex flex-col items-start text-left group cursor-pointer transition-all duration-300 ${activeFeature.title === feat.title ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full shadow-lg shrink-0 transition-colors ${activeFeature.title === feat.title ? 'bg-teal-600' : 'bg-white'}`}>
                      <feat.icon className={`w-5 h-5 ${activeFeature.title === feat.title ? 'text-white' : 'text-teal-600'}`} />
                    </div>
                    <h4 className={`text-lg lg:text-xl font-bold ml-3 transition-colors ${activeFeature.title === feat.title ? 'text-teal-400' : 'text-white'}`}>
                      {feat.title}
                    </h4>
                  </div>
                  <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </ParallaxBackground>
    </section>
  


      {/* ===================================================================
        # SEÇÃO QUATRO - EM DESENVOLVIMENTO (VALORES)
        =================================================================== */}
      <section id="desenvolvimento" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white p-10 rounded-xl shadow-2xl border-b-4 border-teal-600">
            <Code className="w-16 h-16 text-teal-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-extrabold text-black mb-4">
              Nossa Missão
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Estamos dedicados a construir a ferramenta mais completa e intuitiva para a gestão de grupos musicais.
            </p>
            <div className="inline-block bg-yellow-100 border-l-4 border-yellow-500 p-4 text-left">
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">Em Desenvolvimento</h3>
                <p className="text-lg text-yellow-700">
                    O Harmony Maestro está em constante evolução. Novas funcionalidades e otimizações são liberadas semanalmente para garantir a melhor experiência para os líderes e membros da banda.
                </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
        # SEÇÃO CINCO - TELAS - PARALLAX 3
        =================================================================== */}
      {/* ... (SEÇÃO CINCO - TELAS - PARALLAX 3) ... */}
      <section id="telas">
        <ParallaxBackground className="bg-telas-parallax">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Telas
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Confira a interface moderna e intuitiva do Harmony Maestro, projetada para ser fácil de usar em qualquer dispositivo.
              </p>
            </div>

            {/* Carrossel de Telas (Estrutura Atualizada) */}
            <div className="relative">
              {/* Área das Imagens */}
              <div className="overflow-hidden rounded-xl shadow-2xl border-4 border-teal-600 h-96 md:h-[600px] flex items-center justify-center bg-gray-900/90">
                <img
                  // 🚨 Renderiza a tela atual com base no estado
                  src={screens[currentScreenIndex].src}
                  alt={screens[currentScreenIndex].alt}
                  // Adicionamos a classe 'opacity-100' para que a imagem apareça (o `transition` do `*` no index.css já dará o efeito)
                  className="w-full md:w-3/4 object-contain opacity-100 transition-opacity duration-700"
                />
              </div>

              {/* Botões de Navegação */}
              <button 
                onClick={prevScreen} // 🆕 Lógica do botão
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-r-lg transition z-20"
                aria-label="Tela Anterior"
              >
                <ArrowRight className="w-6 h-6 rotate-180" />
              </button>
              <button 
                onClick={nextScreen} // 🆕 Lógica do botão
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-l-lg transition z-20"
                aria-label="Próxima Tela"
              >
                <ArrowRight className="w-6 h-6" />
              </button>

              {/* Indicadores (Dots) */}
              <div className="flex justify-center space-x-2 mt-4">
                {screens.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreenIndex(index)} // 🆕 Permite clicar para ir à tela
                    className={`w-3 h-3 rounded-full transition-colors duration-300 
                      ${index === currentScreenIndex ? 'bg-teal-600' : 'bg-gray-400 hover:bg-gray-300'}`}
                    aria-label={`Ir para a tela ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </ParallaxBackground>
      </section>

      {/* ===================================================================
        # SEÇÃO SEIS - CONTATO
        =================================================================== */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-black mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-600">
              Tem alguma dúvida ou gostaria de fazer uma parceria? Mande sua mensagem!
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-xl">
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" id="name" name="name" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" name="email" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem</label>
                <textarea id="message" name="message" rows="4" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2"></textarea>
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 transition duration-150"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===================================================================
        # SEÇÃO SETE - DÚVIDAS FREQUENTES & FOOTER - PARALLAX 4
        =================================================================== */}
      <section id="duvidas">
        <ParallaxBackground className="bg-faq-parallax">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white">
            <div className="text-center mb-12">
              <HelpCircle className="w-10 h-10 text-teal-400 mx-auto mb-4" />
              <h2 className="text-4xl font-extrabold mb-4">
                Dúvidas Frequentes
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Encontre respostas rápidas para as perguntas mais comuns sobre a plataforma.
              </p>
            </div>

            {/* Estrutura de FAQ - Pode ser expandida com lógica de state/accordion */}
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { question: "O Harmony Maestro é gratuito?", answer: "Sim, oferecemos um plano básico gratuito para grupos menores. Consulte nossos planos para recursos premium." },
                { question: "Quais tecnologias foram usadas no desenvolvimento?", answer: "A plataforma utiliza React com Vite no Frontend, Node.js/Express no Backend e PostgreSQL (via Prisma) para o banco de dados. O design é totalmente responsivo com Tailwind CSS." },
                { question: "Como funciona a função de Rodízio Automático de Escalas?", answer: "O sistema utiliza um algoritmo de round-robin baseado em configurações semanais definidas pelo administrador para garantir que os músicos sejam escalados de forma justa e alternada." },
                { question: "O sistema é compatível com meu celular?", answer: "Absolutamente. O Harmony Maestro é totalmente responsivo, adaptando-se a qualquer tela (desktop, tablet ou celular) através do seu navegador web." }
              ].map((item, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-5 rounded-lg border border-teal-600">
                  <h3 className="text-lg font-bold text-white mb-2">{item.question}</h3>
                  <p className="text-gray-200">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ===================================================================
            # FOOTER
            =================================================================== */}
          <footer className="w-full py-6 bg-black/50 border-t border-teal-600/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-sm text-gray-400">
                © 2025 Feito por João Victor. Todos os direitos reservados.
              </p>
            </div>
          </footer>

        </ParallaxBackground>
      </section>

    </div>
  );
}