// Mock data for Hamsi AI

export const mockConversations = [
  {
    id: '1',
    mode: 'casual',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Merhaba! Nasılsın?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'm2',
        role: 'assistant',
        content: 'Merhaba! Ben Hamsi AI, çok iyiyim teşekkür ederim! Size nasıl yardımcı olabilirim?',
        timestamp: new Date(Date.now() - 3500000).toISOString()
      }
    ]
  }
];

export const mockModes = [
  {
    id: 'casual',
    name: 'Günlük',
    description: 'Rahat ve samimi sohbet',
    icon: 'MessageCircle'
  },
  {
    id: 'formal',
    name: 'Resmi',
    description: 'Profesyonel ve resmi iletişim',
    icon: 'Briefcase'
  },
  {
    id: 'professional',
    name: 'Teknik',
    description: 'Detaylı ve teknik açıklamalar',
    icon: 'Code'
  }
];

export const generateMockResponse = (message, mode) => {
  const responses = {
    casual: [
      'Anladım! Size yardımcı olayım.',
      'Elbette, hemen bakalım!',
      'Güzel soru! İşte cevabım:'
    ],
    formal: [
      'Talebinizi aldım. Detaylı bilgi için:',
      'Sorununuzu anladım. Çözüm önerim:',
      'İlginiz için teşekkür ederim. Yanıtım:'
    ],
    professional: [
      'Teknik açıdan bakıldığında:',
      'Detaylı analiz sonucu:',
      'Profesyonel değerlendirmem:'
    ]
  };

  const randomResponse = responses[mode][Math.floor(Math.random() * responses[mode].length)];
  return `${randomResponse} ${message}`;
};