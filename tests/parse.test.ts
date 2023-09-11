import { parse } from "@formatjs/icu-messageformat-parser";
import IntlMessageFormat from "intl-messageformat";
import { expect, it, } from "vitest";
import { translator, translateJson, t } from "../src/index";
import tl from "./example-translations.json";

it("should parse icu message properly", () => {
  // arrange
  const icu = "hello {name}";
  const translation = { name: "World" };
  const ast = parse(icu);
  const msgFn = new IntlMessageFormat(ast, "en");

  // act
  const msg = msgFn.format(translation);

  // assert
  expect(msg).toBe("hello World");
})

it("should translate simple hello world", () => {
  // arrange
  const icu = "hello {name}";
  const options = { name: "World" };

  // act
  const translation = translator(icu, options, "en");

  // assert
  expect(translation).toBe("hello World");
})

it("should provide intellisense for json object", () => {
  const english = translateJson(tl, "greetings", "en", {
    name: "World"
  });

  const dansk = translateJson(tl, "greetings", "da", {
    name: "Verden"
  });

  const nihon = translateJson(tl, "greetings", "jpn", {
    name: "Sekai"
  });

  expect(english).toBe("Hello World!");
  expect(dansk).toBe("Hej Verden!");
  expect(nihon).toBe("Konnichiwa Sekai-san!");
})

it("should store t", () => {
  const translator = t(tl);
  const hello = translator("greetings", "en", {
    name: "John"
  });
})