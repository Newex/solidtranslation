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

const translateJson = <T extends TranslationLookup> (json: T, key: keyof T, locale: NestedKeyOf<T>, options?: Options, format?: Partial<Formats>) => {
  const tl: Translation = json[key];
  let result: string | undefined | string[];
  try {
    const icu = tl[locale];
    if (!icu) {
      throw new Error(`Missing translations for locale: ${locale} with key: ${key.toString()}`);
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
        if (!options || !options[prop]) {
          throw new Error(`Remember to add options with property to interpolate: options.${prop}`);
        }
      }
    }

    const messageFn = new IntlMessageFormat(ast, locale, format);
    result = messageFn.format(options)
  } catch (error) {
    throw error;
  }

  return result;
}

export const translate = <T extends TranslationLookup>(json: T, locale: NestedKeyOf<T>) => {
  return (key: keyof T, options?: Options, format?: Partial<Formats>) => {
    return translateJson<T>(json, key, locale, options, format);
  }
}