type LangCode = 'en' | 'pl' | 'es';

export class TranslationsDto {
  key: string;
  translations: {
    [key in LangCode]?: string;
  };
}