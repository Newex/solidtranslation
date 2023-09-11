import { expect, it, } from "vitest";
import { translate } from "../src/index";
import tl from "./example-translations.json";

it("should properly translate when given locale, key and options", () => {
  // arrange
  const t = translate(tl, "en");
  const options = {
    name: "World"
  };

  // act
  const hello = t("greetings", options);

  // assert
  expect(hello).toBe("Hello World!");
})

it("should throw error when there is a mismatch between interpolated string and options argument", () => {
  // arrange
  const t = translate(tl, "da");
  const options = {
    wrong: "No options property"
  };

  // act
  const hello = () => t("greetings", options);

  // arrange
  expect(hello).toThrowError(/^Remember to add options with property to interpolate: options\.name$/);
})