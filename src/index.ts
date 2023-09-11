import { parse } from "@formatjs/icu-messageformat-parser";
import IntlMessageFormat, { FormatXMLElementFn, PrimitiveType, Formats } from "intl-messageformat";

export const translator = <T extends Record<string, PrimitiveType | FormatXMLElementFn<string>>, T2>(text: string, options: T, locale: string) => {
  const ast = parse(text);
  const messageFn = new IntlMessageFormat(ast, locale);
  const message = messageFn.format(options)
  return message;
}

// Modified to not concatenate using period.
// source: https://medium.com/xgeeks/typescript-utility-keyof-nested-object-fa3e457ef2b2
type NestedKeyOf<ObjectType extends object> = 
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

export const translateJson = <T extends TranslationLookup> (json: T, key: keyof T, locale: NestedKeyOf<T>, options?: Options, format?: Partial<Formats>) => {
  const tl: Translation = json[key];
  const icu = tl[locale];

  let result: string | undefined | string[];
  if (options) {
    const ast = parse(icu);
    const messageFn = new IntlMessageFormat(ast, locale, format);
    result = messageFn.format(options)
  } else {
    result = icu;
  }

  return result;
}

export const t = <T extends TranslationLookup>(json: T) => {
  return (key: keyof T, locale: NestedKeyOf<T>, options?: Options, format?: Partial<Formats>) => {
    return translateJson<T>(json, key, locale, options, format);
  }
}