export type Lang = 'ko' | 'en';

export const siteName = 'Between the Lines';

// Site chrome (nav, section titles) intentionally stays in English for both
// languages, matching the site design. Only strings that differ live here.
export const ui = {
  ko: {
    description: '논문과 책을 읽고 남기는 기록',
    attributionNotice: '리뷰에 인용된 원저작물의 모든 형태의 자료에 대한 저작권은 원저작자에게 있습니다.',
  },
  en: {
    description: 'Notes on papers and books',
    attributionNotice: 'Any material quoted from the original works remains © its original authors.',
  },
} as const;

export function t(lang: Lang) {
  return ui[lang];
}
