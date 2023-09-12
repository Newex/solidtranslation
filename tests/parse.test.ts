import { expect, it, } from "vitest";
import { SolidTranslationOptions, translate } from "../src/index";
import tl from "./example-translations.json";

it("should properly translate when given locale, key and options", () => {
  // arrange
  const t = translate(tl, "en");
  const values = {
    name: "World"
  };

  // act
  const hello = t("greetings", values);

  // assert
  expect(hello).toBe("Hello World!");
})

it("should throw error when there is a mismatch between interpolated string and options argument", () => {
  // arrange
  const t = translate(tl, "da");
  const values = {
    wrong: "No options property"
  };

  // act
  const hello = () => t("greetings", values);

  // arrange
  expect(hello).toThrowError(/^Remember to add options with property to interpolate: values\.name$/);
})

it("should fallback to the specified language if no translation is found", () => {
  // arrange
  const options: SolidTranslationOptions = {
    fallbackLanguage: "en",
    strict: false
  };
  const t = translate(tl, "de", options);

  // act
  const hello = t("greetings", { name: "English" });

  // assert
  expect(hello).toBe("Hello English!");
})

it("should return missing translation text if missing translation", () => {
  // arrange
  const options: SolidTranslationOptions = {
    missingTranslationMessage: "NOT TRANSLATED YET!",
    strict: false
  };
  const t = translate(tl, "en", options);

  // act
  const text = t("another");

  // assert
  expect(text).toBe("NOT TRANSLATED YET!");
})

it("should return missing text if translation is an empty text", () => {
  // arrange
  const options: SolidTranslationOptions = {
    missingTranslationMessage: "MISSING"
  };
  const t = translate(tl, "de", options);

  // act
  const empty = t("another");

  // assert
  expect(empty).toBe("MISSING");
})

it("should pluralize translation correctly", () => {
  // arrange
  const t = translate(tl, "da");

  // act
  const text = t("books", { n: 2 });

  // assert
  expect(text).toBe("Jeg har købt 2 bøger");
})

it("should use singular form in pluralization if set", () => {
  // arrange
  const t = translate(tl, "da");

  // act
  const text = t("books", { n: 1 });

  // assert
  expect(text).toBe("Jeg har købt 1 bog");
})

it("should return empty string on erroneous translations if strict is set to false", () => {
  // arrange
  const options: SolidTranslationOptions = {
    strict: false
  };
  const t = translate(tl, "en", options);

  // act --> should provide { name } to be correct
  const empty = t("greetings", { no: "name" });

  // assert
  expect(empty).toBe("");
})

it("should ensure the options given during the translation are preferred", () => {
  // arrange
  const globalOptions: SolidTranslationOptions = {
    strict: true
  };
  const t = translate(tl, "en", globalOptions);

  // act, turn off strict
  const empty = t("greetings", { no: "name" }, {
    settings: {
      strict: false
    },
  });

  // assert
  expect(empty).toBe("");
})