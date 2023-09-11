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
  expect(hello).toThrowError(/^Remember to add options with property to interpolate: options\.name$/);
})

it("should fallback to the specified language if no translation is found", () => {
  // arrange
  const options: SolidTranslationOptions = {
    fallbackLanguage: "en"
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
    missingTranslationMessage: "NOT TRANSLATED YET!"
  };
  const t = translate(tl, "en", options);

  // act
  const text = t("another");

  // assert
  expect(text).toBe("NOT TRANSLATED YET!");
})

it("should return empty text if translation is an empty text", () => {
  // arrange
})