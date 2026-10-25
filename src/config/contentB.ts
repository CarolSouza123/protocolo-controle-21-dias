// Copy de teste (versão B), servida em /copy/bio.
// Textos enviados pela Caroline em 24/10/2026. A copy original não é tocada.
// No lugar da prova social, por enquanto, vai o bloco de situações da original;
// o carrossel de depoimentos (src/components/TestimonialsCarousel.tsx) fica guardado
// para quando os depoimentos reais chegarem.

export const pageContentB = {
  urgencyBar: {
    enabled: false,
    text: '',
  },
  hero: {
    eyebrow: 'EXCLUSIVO PARA HOMENS',
    image: '/images/mockup-hero.webp',
    imageAlt: 'Mockup do Web App na tela do celular',
    headline: 'Você tenta segurar, fica tenso e acaba antes do que gostaria?',
    body: 'Um protocolo digital com treinos guiados de 5 minutos para praticar o controle muscular e trabalhar a respiração durante 21 dias.',
    bullets: [
      'Treinos guiados diretamente no celular',
      'Sessões de aproximadamente 5 minutos',
      'Acesso digital discreto, sem baixar aplicativo da loja',
    ],
    ctaLabel: 'QUERO RETOMAR O CONTROLE',
    securityImage: '/images/selos-seguranca-compra.svg',
    securityImageAlt: 'Selos de compra segura, satisfação garantida e privacidade protegida',
  },
  situations: {
    title: 'Você já tentou resolver isso de outras formas?',
    subtitle: '',
    items: [
      { eyebrow: '01', title: 'Tentar segurar na força de vontade', text: 'Você fica pensando em não terminar e acaba mais preocupado em se controlar do que em aproveitar o momento.' },
      { eyebrow: '02', title: 'Depender de comprimidos ou sprays', text: 'Você procura uma solução prática, mas também quer conhecer outras formas de trabalhar o controle ejaculatório.' },
      { eyebrow: '03', title: 'Fazer exercícios soltos da internet', text: 'Um vídeo ensina uma coisa, outro recomenda algo diferente. Sem uma sequência organizada, fica difícil saber como estruturar sua prática.' },
    ],
    closing: 'A proposta do Protocolo 21 Dias: reunir exercícios guiados e recursos de respiração em uma rotina organizada, direto no celular.',
  },
  modulesSection: {
    title: '21 dias. Treinos de 5 minutos. Tudo no celular.',
    subtitle: 'Um programa digital para organizar sua prática e ajudar você a desenvolver consciência corporal e mais confiança na intimidade.',
    closingLabel: 'Acesso digital',
    closingText: 'Abra o Web App pelo navegador do celular e consulte os materiais disponíveis.',
  },
  modules: [
    { src: '/images/material01.webp', alt: 'Imagem do Material 01', label: 'Imagem do Material 01', ratio: '1:1' as const, eyebrow: 'Material 01', title: 'Guia de Localização do Músculo Certo', description: 'Uma referência para entender qual músculo está sendo trabalhado e acompanhar os exercícios propostos.' },
    { src: '/images/material02.webp', alt: 'Imagem do Material 02', label: 'Imagem do Material 02', ratio: '1:1' as const, eyebrow: 'Material 02', title: 'Cronômetro Guiado de 5 Minutos', description: 'Uma ferramenta para acompanhar as sessões sem precisar improvisar a duração de cada treino.' },
  ],
  testimonials: {
    title: 'Conheça experiências reais de quem utilizou o protocolo',
    subtitle: 'Veja relatos autênticos de usuários sobre sua experiência com os materiais e a rotina de exercícios.',
    items: [] as string[],
  },
  bonusesSection: { title: 'Você também recebe 2 bônus' },
  bonuses: [
    { src: '/images/bonus01.webp', alt: 'Imagem do bônus 01', label: 'Imagem do bônus 01', ratio: '1:1' as const, eyebrow: 'Bônus 01', title: 'Reset da Respiração na Hora H', description: 'Um exercício guiado de respiração para ajudar você a praticar o controle da tensão e do nervosismo.', value: '' },
    { src: '/images/bonus02.webp', alt: 'Imagem do bônus 02', label: 'Imagem do bônus 02', ratio: '1:1' as const, eyebrow: 'Bônus 02', title: 'Áudio Guiado SOS Pré-Hora H', description: 'Uma faixa de aproximadamente 2 minutos para acompanhar sua preparação antes de um encontro íntimo.', value: '' },
  ],
  offersSection: {
    title: 'Comece seu treino hoje',
    paymentSecurityImage: '/images/metodos-pagamento-seguranca.svg',
    paymentSecurityAlt: 'Métodos de pagamento e selos de compra segura, satisfação garantida e privacidade protegida',
  },
  offers: {
    simple: {
      title: 'Protocolo 21 Dias + Bônus Inclusos',
      items: ['Guia de Localização do Músculo Certo', 'Web App com Cronômetro dos 21 Dias', 'Bônus 01: Reset da Respiração na Hora H', 'Bônus 02: Áudio Guiado SOS Pré-Hora H', 'Acesso digital pelo celular'],
      previousPrice: 'R$ 67,00', installmentCount: 0, installmentValue: '', cashValue: 'R$ 27,00', ctaLabel: 'QUERO ACESSAR O PROTOCOLO',
    },
    complete: {
      badge: '', title: 'Protocolo 21 Dias + Bônus Inclusos',
      subtitle: 'Tenha acesso ao Protocolo 21 Dias e aos dois bônus complementares.',
      items: [
        { label: 'Guia de Localização do Músculo Certo' },
        { label: 'Web App com Cronômetro dos 21 Dias' },
        { label: 'Bônus 01: Reset da Respiração na Hora H' },
        { label: 'Bônus 02: Áudio Guiado SOS Pré-Hora H' },
        { label: 'Acesso digital pelo celular' },
      ],
      previousPrice: 'R$ 67,00', installmentCount: 0, installmentValue: '', cashValue: 'R$ 27,00', ctaLabel: 'QUERO ACESSAR O PROTOCOLO',
    },
    popup: {
      eyebrow: 'Espere! Não saia ainda...',
      message: '',
      title: 'Oferta especial', previousPrice: 'R$ 67,00', installmentCount: 0, installmentValue: '', cashValue: 'R$ 27,00',
      ctaLabel: 'QUERO ACESSAR O PROTOCOLO', secondaryLabel: 'Não, quero continuar com a oferta.',
    },
  },
  guarantee: {
    image: '/images/selo-garantia-7-dias.svg',
    imageAlt: 'Selo de garantia de 7 dias',
    days: 7,
    title: '7 dias para avaliar o protocolo',
    body: 'Conheça os materiais e avalie se o programa atende às suas expectativas. Se decidir solicitar o reembolso dentro do prazo, siga as condições e o procedimento de garantia informados na compra.',
  },
  faqSection: { title: 'Perguntas frequentes' },
  faq: [
    { question: 'Preciso baixar um aplicativo?', answer: 'Não. O protocolo é acessado pelo navegador do celular, como um Web App.' },
    { question: 'Como recebo o acesso?', answer: 'O acesso é digital. As instruções de entrega serão apresentadas após a confirmação da compra.' },
    { question: 'Quanto tempo dura cada treino?', answer: 'As sessões propostas têm aproximadamente 5 minutos.' },
    { question: 'Preciso parar de usar medicamentos?', answer: 'Não interrompa medicamentos prescritos por conta própria. O protocolo não substitui avaliação ou tratamento médico.' },
    { question: 'E se eu não gostar?', answer: 'Você poderá solicitar o reembolso dentro do prazo e conforme as condições da garantia de 7 dias.' },
  ],
  footer: { brand: 'Protocolo 21 Dias', copyright: '© 2026 Protocolo 21 Dias' },
}
