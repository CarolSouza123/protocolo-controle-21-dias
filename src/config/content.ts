export type MediaItem = { src: string; alt: string; label: string; ratio: '1:1' | '2:3' | '3:2' | '3:4' }
export type ProductItem = MediaItem & { eyebrow: string; title: string; description: string }

export const pageContent = {
  urgencyBar: {
    enabled: true,
    text: 'ATENÇÃO: oferta disponível até',
  },
  hero: {
    image: '/images/mockup-hero.webp',
    imageAlt: 'Mockup do Web App na tela do celular',
    headline: 'Protocolo 21 Dias: um app com treinos de 5 minutos por dia, para controlar sua ejaculação em poucos dias',
    body: 'Para homens que querem durar até 3x mais na cama e não depender de pílulas azuis, sprays anestésicos ou ficar pensando em coisas chatas na hora H.',
    bullets: [
      'Treino muscular guiado na tela do celular.',
      'Acesso digital discreto e direto após a confirmação.',
    ],
    ctaLabel: 'Quero durar mais',
    securityImage: '/images/selos-seguranca-compra.svg',
    securityImageAlt: 'Selos de compra segura, satisfação garantida e privacidade protegida',
  },
  situations: {
    title: 'Feito para homens que vivem isso',
    subtitle: 'Se alguma dessas cenas é a sua, o protocolo foi montado para ela.',
    items: [
      { title: 'Acaba antes de entrar no ritmo', text: 'Ela mal começou a entrar no ritmo e você já perdeu o controle. Na próxima vez, a preocupação chega antes da própria relação.', help: 'Treino diário de 5 minutos que condiciona o músculo do controle, de forma progressiva, dia após dia.' },
      { title: 'A cabeça não desliga', text: 'Em vez de curtir o momento, você fica de olho no tempo, com medo de falhar de novo.', help: 'A aba de respiração do app ensina a baixar a adrenalina antes e durante, para a cabeça parar de atrapalhar.' },
      { title: 'Depender de spray ou pílula', text: 'O spray tira a sensibilidade e a pílula vira muleta. Sem eles, a insegurança volta do mesmo jeito.', help: 'Aqui o caminho é treino, não efeito temporário: o controle fica no seu corpo, não no produto.' },
      { title: 'Começar a evitar a hora H', text: 'De tanta frustração, você passa a evitar a relação, e a distância entre vocês dois só aumenta.', help: 'Sessões curtas e discretas no celular, no seu ritmo e sem ninguém saber, para retomar a iniciativa.' },
    ],
  },
  modulesSection: {
    title: 'O que você recebe',
    subtitle: 'Seu treino diário de controle físico reunido em um só lugar',
  },
  modules: [
    { src: '/images/material01.webp', alt: 'Imagem do Material 01', label: 'Imagem do Material 01', ratio: '1:1' as const, eyebrow: 'Material 01', title: 'O Guia de Localização do Músculo Certo', description: 'O passo a passo simples para você encontrar o músculo exato que segura a ejaculação por mais tempo e nunca mais errar contraindo a barriga ou o glúteo por engano.' },
    { src: '/images/material02.webp', alt: 'Imagem do Material 02', label: 'Imagem do Material 02', ratio: '1:1' as const, eyebrow: 'Material 02', title: 'O Cronômetro Guiado de 5 Minutos', description: 'Você só dá o play no celular e segue a contagem automática na tela de contrair e relaxar, sem precisar contar nada na cabeça.' },
  ],
  bonusesSection: { title: 'Além do protocolo principal, você recebe 2 bônus exclusivos hoje' },
  bonuses: [
    { src: '/images/bonus01.webp', alt: 'Imagem do bônus 01', label: 'Imagem do bônus 01', ratio: '1:1' as const, eyebrow: 'Bônus 01', title: 'O Reset da Respiração na Hora H', description: 'A técnica rápida para puxar e soltar o ar e desarmar o nervosismo assim que você sente que está chegando perto do limite.', value: '' },
    { src: '/images/bonus02.webp', alt: 'Imagem do bônus 02', label: 'Imagem do bônus 02', ratio: '1:1' as const, eyebrow: 'Bônus 02', title: 'Áudio Guiado SOS Pré-Hora H', description: 'Uma faixa de 2 minutos para colocar no fone de ouvido antes do encontro, desacelerar o coração e entrar no quarto sem travar de ansiedade.', value: '' },
  ],
  offersSection: {
    title: 'Comece seu treino hoje com valor promocional',
    paymentSecurityImage: '/images/metodos-pagamento-seguranca.svg',
    paymentSecurityAlt: 'Métodos de pagamento e selos de compra segura, satisfação garantida e privacidade protegida',
  },
  offers: {
    simple: {
      title: 'Protocolo 21 Dias + Bônus Inclusos',
      items: ['Guia de Localização do Músculo Certo', 'Web App com Cronômetro dos 21 Dias', 'Bônus 01: O Reset da Respiração na Hora H', 'Bônus 02: Áudio Guiado SOS Pré-Hora H', 'Acesso digital imediato no seu celular'],
      previousPrice: 'R$ 67,00', installmentCount: 3, installmentValue: 'R$ 9,80', cashValue: 'R$ 27,00', ctaLabel: 'Quero durar mais',
    },
    complete: {
      badge: '', title: 'Protocolo 21 Dias + Bônus Inclusos',
      subtitle: 'Tudo o que você precisa para assumir o controle na cama.',
      items: [
        { label: 'Guia de Localização do Músculo Certo' },
        { label: 'Web App com Cronômetro dos 21 Dias' },
        { label: 'Bônus 01: O Reset da Respiração na Hora H' },
        { label: 'Bônus 02: Áudio Guiado SOS Pré-Hora H' },
        { label: 'Acesso digital imediato no seu celular' },
      ],
      previousPrice: 'R$ 67,00', installmentCount: 3, installmentValue: 'R$ 9,80', cashValue: 'R$ 27,00', ctaLabel: 'Quero durar mais',
    },
    popup: {
      eyebrow: 'Espere! Não saia ainda...',
      message: '',
      title: 'Oferta especial', previousPrice: 'R$ 67,00', installmentCount: 3, installmentValue: 'R$ 9,80', cashValue: 'R$ 27,00',
      ctaLabel: 'Quero durar mais', secondaryLabel: 'Não, quero continuar com a oferta.',
    },
  },
  guarantee: {
    image: '/images/selo-garantia-7-dias.svg',
    imageAlt: 'Selo de garantia de 7 dias',
    days: 7,
    title: 'Teste o protocolo sem assumir nenhum risco',
    body: 'Você tem 7 dias de garantia para abrir o aplicativo e treinar no seu quarto com total privacidade. Se você achar que o método não é para você, basta pedir o reembolso com um clique e devolvemos 100% do seu dinheiro, sem perguntas. Você tem 7 dias para decidir.',
  },
  faqSection: { title: 'Ainda está com alguma dúvida?' },
  faq: [
    { question: 'Preciso baixar aplicativo pesado na loja do celular?', answer: 'Não. O protocolo abre direto no seu navegador como um Web App leve, sem ocupar memória e sem ícones estranhos na tela inicial do celular.' },
    { question: 'Como eu recebo o acesso?', answer: 'Assim que o pagamento no Pix ou cartão for confirmado, os dados de acesso chegam na hora no seu e-mail cadastrado.' },
    { question: 'Vai aparecer o nome do produto na fatura do cartão?', answer: 'Não. A cobrança vem com uma descrição neutra e totalmente discreta para proteger sua privacidade.' },
    { question: 'Quanto tempo dura cada treino?', answer: 'Apenas 5 minutos por dia, guiados direto pelo cronômetro na tela do seu aparelho.' },
    { question: 'E se eu não gostar?', answer: 'Basta mandar uma mensagem dentro do prazo de 7 dias e estornamos o valor total, direto na sua conta.' },
  ],
  footer: { brand: 'Protocolo 21 Dias', copyright: '© 2026 Protocolo 21 Dias • Treinamento muscular e condicionamento pélvico masculino.' },
}
