# Prismic Label Boilerplate

Use one label document section per application locale file. Every direct child
of `documents` becomes a Prismic Custom Type and a relationship on that
application's parent document when models are generated.

```json
{
  "documents": {
    "flight_search": {
      "airport": {
        "label": "Airport"
      },
      "passengers": "Passengers"
    },
    "payment": {
      "card_number": "Card number"
    }
  },
  "shared": {
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

The generator includes `flight_search` and `payment`. It does not generate a
Custom Type for `shared`.

## Team Flow

1. Add the new document under `documents` in every locale JSON file.
2. Run `pnpm prismic:models:generate`.
3. Review the generated Custom Type and parent relationship in Slice Machine.
4. Run `pnpm prismic:types:generate` after Slice Machine updates Prismic.
5. Publish and configure the document content in Prismic.

Existing projects that keep documents at the JSON root are supported during
migration. New work should use the `documents` section.
