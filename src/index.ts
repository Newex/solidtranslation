import { parse } from "@formatjs/icu-messageformat-parser";
import IntlMessageFormat, { FormatXMLElementFn, PrimitiveType, Formats } from "intl-messageformat";

// Modified to not concatenate using period.
// source: https://medium.com/xgeeks/typescript-utility-keyof-nested-object-fa3e457ef2b2
export type NestedKeyOf<ObjectType extends object> = 
{[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object 
? `${NestedKeyOf<ObjectType[Key]>}`
: `${Key}`
}[keyof ObjectType & (string | number)];

export interface Translation {
  [index: string]: string
}
export type TranslationLookup = {
  [index: string]: Translation
}

export type Options = Record<string, PrimitiveType | FormatXMLElementFn<string>>;

export interface SolidTranslationOptions {
  /**
   * If true then an item must have a translation. Furthermore a translation must have the correct input values (if any) when called.
   */
  strict?: boolean,

  /**
   * The language to lookup for translations if the selected language does not contain a translation.
   * Note: that the fallback language is only searched if strict is set to false.
   */
  fallbackLanguage?: string,

  /**
   * The missing translation text.
   * Note that the missing translation text is only returned if strict is set to false and the fallback language has not defined any translations.
   */
  missingTranslationMessage?: string,
}

const defaultSolidOptions: SolidTranslationOptions = {
  strict: true,
  missingTranslationMessage: "-"
}

const translateJson = <T extends TranslationLookup> (json: T, key: keyof T, locale: NestedKeyOf<T>, values?: Options, format?: Partial<Formats>, solidOptions?: SolidTranslationOptions) => {
  let { strict, fallbackLanguage, missingTranslationMessage } = solidOptions ?? defaultSolidOptions;
  strict ??= defaultSolidOptions.strict;
  fallbackLanguage ??= defaultSolidOptions.fallbackLanguage;
  missingTranslationMessage ??= defaultSolidOptions.missingTranslationMessage;
  const tl: Translation = json[key];
  let result: string | undefined | string[];
  try {
    let icu = tl[locale];
    if (icu === undefined && strict) {
      throw new Error(`Missing translations for locale: ${locale} with key: ${key.toString()}`);
    } else if (!icu) {
      // fallback
      if (fallbackLanguage) {
        icu = tl[fallbackLanguage];
      }

      if (!icu && missingTranslationMessage !== undefined) {
        icu = missingTranslationMessage;
      }
    }

    const ast = parse(icu);

    for (let entry of ast) {
      // 
      if (entry.type === 0) {
        continue;
      }

      if (entry.type === 1) {
        // Interpolation
        const prop = entry.value;
        if ((!values || !values[prop]) && strict) {
          throw new Error(`Remember to add options with property to interpolate: values.${prop}`);
        }
      }
    }

    const messageFn = new IntlMessageFormat(ast, locale, format);
    result = messageFn.format(values)
  } catch (error) {
    if (strict) {
      throw error;
    } else {
      return "";
    }
  }

  return result;
}

export const translate = <T extends TranslationLookup>(json: T, locale: NestedKeyOf<T>, options?: SolidTranslationOptions) => {
  const solidOptions = options;
  return (key: keyof T, options?: Options, format?: Partial<Formats>) => {
    return translateJson<T>(json, key, locale, options, format, solidOptions);
  }
}