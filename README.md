# SolidTranslation

# What is it?

This is a translation library that uses @formatjs icu message parser to parse ICU messages.  
Given a javascript object containing translations in a specific format, this library will extract and parse those translations.

# How to install?
Run the following:

```console
$ npm install -D @newex/solidtranslation
```

# Show me
Example given a json file containing the following translations:

```json
// example.json
{
  "greetings": {
    "en": "Hello {name}",
    "da": "Hej {name}",
    "jp": "Konnichiwa {name}-san"
  }
}
```

You can import this resource and parse the result like so:

```typescript
import tl from "example.json";
import { translate } from "@newex/solidtranslation";

// Create the translator t for the locale "en"
const t = translate(tl, "en");

const message = t("greetings", { name: "World!" });

// Prints: "Hello World!"
console.log(message);
```

## Configure translation options
You can provide options for `solidtranslation` on how to handle translations.  
The options are:

```typescript
// SolidTranslationOptions
{
  // If true then exception will be thrown
  // whenever there are missing arguments to the parser or missing translation keys.
  strict: boolean,

  // The language to try if missing translation key.
  // This will only be tried if `strict` is false.
  fallbackLanguage: string,

  // The default message to show if no translation was found for the given key.
  // This will only be tried if `strict` is false.
  missingTranslationMessage: string
}
```


There are 2 ways to define these options. The first way is globally.  
Example:

```typescript
import tl from "example.json";
import { translate } from "@newex/solidtranslation";

// Create the translator t for the locale "fr"
const t = translate(tl, "fr", {
  strict: false,
  fallbackLanguage: "en",
  missingTranslationMessage: "traduction manquante"
});

const message1 = t("greetings", { name: "Monde!" });
const message2 = t("hello", { name: "Monde!" });

// Prints: "Hello Monde!"
console.log(message1);

// Prints: "traduction manquante"
console.log(message2);
```

The second way is per translation.  
Example:

```typescript
import tl from "example.json";
import { translate } from "@newex/solidtranslation";

// Create the translator t for the locale "fr"
const t = translate(tl, "fr");

const message = t("greetings", { name: "Monde!" }, {
  settings: {
    strict: false,
    fallbackLanguage: "da",
    missingTranslationMessage: "mangler oversættelse"
  }
});

// Prints: "Hej Monde!"
console.log(message);
```

## ICU message format recap
The translation texts are directly used to input into the @formatjs icu parser. And so follow the parsing rules for that.  
Quick recap of ICU message format is:

| Type          | ICU message      | Options             | Output example |
|---------------|------------------|---------------------|----------------|
|**Literal**    | "¡Hola!"         | `undefined`         | "¡Hola!"       |
|**Argument**   | "Hello {name}"   | `{ name: "World" }` | "Hello World"  |
|**Number**     | "Percent: {n, number, percent}"   | `{ n: 0.7 }` | "Percent: 70%"  |
|**Date**       | "The date is: {d, date, short}"   | `{ d: new Date(2020, 6, 30) }` | "The date is: 30/06/2020"  |
|**Select**     | "{gender, select,female {She} male {He} other {They}}"   | `{ gender: 'male' }` | "He"  |
|**Plural**     | "I bought {n, plural, one {# book} other {# books}}"   | `{n: 1}` | "I bought 1 book" |
|**Escape**     | "'<'tag'>' escape"   | `undefined` | "\<tag\> escape"  |

# Why did you choose that JSON format?

The json format that is used in `solidtranslation` is:

```json
{
  "translation-key": {
    "language-key": "ICU message",
    ...
  }
}
```

I have chosen this format because I think this aggregates data that are closely related in a more manageable way.  

Other formats that I've seen usually use the inverse where the outer properties are the `language-keys` and then they separate into `translation-keys`.

The `solidtranslation` json format it is easier to see related translations.