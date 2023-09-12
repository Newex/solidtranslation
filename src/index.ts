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

/**
 * Values to be provided for the translation
 */
export type TranslationValues = Record<string, PrimitiveType | FormatXMLElementFn<string>>;

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

/**
 * Options for translation
 */
export interface Options {
  /**
   * Formatting options
   */
  formatting?: Formats,

  /**
   * Overwrite global settings
   */
  settings?: SolidTranslationOptions
}

const translateJson = <T extends TranslationLookup> (options: SolidTranslationOptions, json: T, key: keyof T, locale: NestedKeyOf<T>, values?: TranslationValues, format?: Partial<Formats>) => {
  let { strict, fallbackLanguage, missingTranslationMessage } = options;
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
  const solidOptions = Object.assign({}, defaultSolidOptions, options);

  /**
   * Translate text to the selected language
   * @param key The key to identify the text
   * @param values (Optional) values to be provided to the translation message
   * @param options (Optional) options to either set formatting or overwriting the global settings
   * @throws Error if in strict mode and no translation has been found using the key or if there is an incorrect parameter for the translation values.
   */
  return (key: keyof T, values?: TranslationValues, options?: Options) => {
    return translateJson<T>(Object.assign({}, solidOptions, options?.settings), json, key, locale, values, options?.formatting ?? {});
  }
}