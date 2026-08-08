export type Lang = 'ko' | 'en';

export const siteName = 'Between the Lines';

// Site chrome (nav, section titles) intentionally stays in English for both
// languages, matching the site design. Only strings that differ live here.
export const ui = {
  ko: {
    description: '논문과 책을 읽고 남기는 기록',
    figuresNotice: '리뷰에 인용된 논문 그림의 저작권은 원저자에게 있습니다.',
  },
  en: {
    description: 'Notes on papers and books',
    figuresNotice: 'Figures quoted from reviewed papers remain © their original authors.',
  },
} as const;

export function t(lang: Lang) {
  return ui[lang];
}
