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

  const featuresList = [
    { title: "Dashboard", icon: LayoutDashboard, description: "Serve para visualizar as atividades, quantidades de membros, relatórios de eventos, e ter uma visão geral do grupo." },
    { title: "Calendário", icon: Calendar, description: "Serve para agendar eventos e compromissos importantes do grupo de forma centralizada." },
    { title: "Biblioteca", icon: Music, description: "Acervo musical para fazer upload de músicas (.mp3/.mp4) e criar pastas para organizar os gêneros." },
    { title: "Partituras", icon: FileText, description: "Serve para fazer upload de partituras em PDF, também com a possibilidade de criar pastas para organizar por autor e gênero." },
    { title: "Séries de Ensaio", icon: Users, description: "Serve para agendar ensaios durante o evento mais próximo, contando com lista de presenças e opção de chat temporário para discussões." },
    { title: "Escalas", icon: ListOrdered, description: "Serve para gerenciar as escalas em eventos padronizados semanalmente, oferecendo um eficiente rodízio automático de membros." },
    { title: "Membros", icon: UserPlus, description: "Aqui o administrador pode convidar novos membros, aceitar solicitações e visualizar todas as informações detalhadas sobre os músicos da banda." },
    { title: "Notificações", icon: Bell, description: "Notificações das atividades, lembretes de eventos e novidades relevantes para manter todos os membros informados e engajados." },
  ];

  return (
    <div className="font-sans text-black antialiased">

      {/* ===================================================================
        # HEADER
        =================================================================== */}
      <header className={`fixed w-full z-30 transition-all duration-300 ease-in-out 
          ${isScrolled 
            ? 'bg-white/90 shadow-lg backdrop-blur-sm' 
            : 'bg-white shadow-md'
          }`
        }>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="#inicio" className="text-xl font-bold text-teal-600">
                <img
                  src="/logo-light.svg"
                  alt="Harmony Maestro"
                  className="h-18 w-auto block"
                />
              </a>
            </div>

            {/* Navegação (Desktop) */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-teal-600 transition duration-150 ease-in-out font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Botão de Ação (Login/Cadastro) */}
            <div className="hidden md:block">
              <a
                href="/login" // Ou a rota que o usuário desejar
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition duration-150"
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
      <section id="inicio" className="pt-20">
        <ParallaxBackground className="bg-hero-parallax">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4">
              Harmony Maestro: Faça gestão da sua banda
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10">
              A plataforma definitiva para líderes de banda e músicos organizarem ensaios, escalas e repertórios com foco total no desempenho e compromisso.
            </p>
            <div className="flex justify-center space-x-4">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Funcionalidades
              </h2>
              <p className="text-xl text-gray-200 max-w-4xl mx-auto">
                Uma visão completa sobre todos os recursos que farão do seu grupo um exemplo de organização e eficiência.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-center">
              {/* Grupo A: Esquerda (4 Funcionalidades) */}
              <div className="flex-1 space-y-8">
                {featuresList.slice(0, 4).map((feat, index) => (
                  <div key={index} className="flex flex-col items-end text-right">
                    <div className="flex items-center mb-2">
                      <h4 className="text-xl font-bold text-white mr-4">{feat.title}</h4>
                      <feat.icon className="w-6 h-6 text-teal-600 bg-white p-1 rounded-full" />
                    </div>
                    <p className="text-gray-300 max-w-md">{feat.description}</p>
                    <img src={`/placeholder-icon-${index + 1}.svg`} alt="" className="hidden" /> {/* Placeholder imagem */}
                  </div>
                ))}
              </div>

              {/* Imagem Centralizada */}
              <div className="flex-none w-full md:w-1/3 p-4">
                <div className="bg-gray-50 p-4 rounded-xl shadow-2xl border-4 border-teal-600">
                  <h4 className="text-center text-gray-600 mb-2 font-bold">Imagem Centralizada</h4>
                  <img
                    src="/placeholder-tela-central.png"
                    alt="Tela do Sistema Harmony Maestro"
                    className="w-full h-auto rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Aqui ficará uma tela do sistema.</p>
                </div>
              </div>

              {/* Grupo B: Direita (4 Funcionalidades) */}
              <div className="flex-1 space-y-8">
                {featuresList.slice(4, 8).map((feat, index) => (
                  <div key={index + 4} className="flex flex-col items-start text-left">
                    <div className="flex items-center mb-2">
                      <feat.icon className="w-6 h-6 text-teal-600 bg-white p-1 rounded-full" />
                      <h4 className="text-xl font-bold text-white ml-4">{feat.title}</h4>
                    </div>
                    <p className="text-gray-300 max-w-md">{feat.description}</p>
                    <img src={`/placeholder-icon-${index + 5}.svg`} alt="" className="hidden" /> {/* Placeholder imagem */}
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

            {/* Carrossel de Telas (Estrutura Simplificada) */}
            <div className="relative">
              {/* Área das Imagens */}
              <div className="overflow-hidden rounded-xl shadow-2xl border-4 border-teal-600 h-96 md:h-[600px] flex items-center justify-center bg-gray-900/90">
                <img
                  src="/placeholder-tela-1.png"
                  alt="Print da Tela Principal do Sistema"
                  className="w-full md:w-3/4 object-contain transition-transform duration-500"
                  // Aqui a lógica real do carrossel usaria state para mudar o src e aplicar transform: translateX
                />
              </div>

              {/* Botões de Navegação */}
              <button className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-white/30 hover:bg-white/50 text-white rounded-r-lg transition">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </button>
              <button className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-white/30 hover:bg-white/50 text-white rounded-l-lg transition">
                <ArrowRight className="w-6 h-6" />
              </button>

              {/* Indicadores (Dots) */}
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
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