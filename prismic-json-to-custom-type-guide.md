# Prismic JSON To Custom Type Guide

This guide explains how local JSON should be understood when generating Prismic
custom types.

## Example input

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name",
    "us_route": [
      {
        "code": "NRT",
        "name": "Narita Airport"
      }
    ]
  }
}
```

## How the current generator reads this

Today the generator flattens nested objects into path keys.

Example:

```txt
passenger.first_name
passenger.last_name
passenger.us_route
```

Because the first path segment is `passenger`, the current tab logic creates a
`Passenger` tab instead of putting the fields in `Main`.

Also, because `us_route` is an array, the current flatten logic treats it like a
single leaf value instead of a structured field. That is why it becomes a `Text`
field today.

## What the expected Prismic model should be

For the above JSON, the expected Prismic structure should usually be:

- `first_name` -> `Text`
- `last_name` -> `Text`
- `us_route` -> `Group`
  - `code` -> `Text`
  - `name` -> `Text`

If the business team does not want a separate `Passenger` tab, these fields
should stay in `Main`.

## JSON shape to Prismic type mapping

Use this mental model while designing labels:

1. String

```json
"first_name": "First name"
```

Prismic:

```txt
Text
```

2. Long content

```json
"description": "Long paragraph content"
```

Prismic:

```txt
StructuredText
```

3. Nested object used only for grouping

```json
{
  "hero": {
    "title": "Book now",
    "subtitle": "Best fares"
  }
}
```

Prismic:

- either `Main` tab with flattened fields
- or `Hero` tab if the project intentionally uses sections as tabs

4. Array of objects

```json
"us_route": [
  {
    "code": "NRT",
    "name": "Narita Airport"
  }
]
```

Prismic:

```txt
Group
  - code: Text
  - name: Text
```

5. Relationship field

If a field links to another Prismic document, it should not come from plain JSON
label text. It should be modeled explicitly as a content relationship field in
the custom type.

## Fix needed for the current generator

For this passenger example, the generator should be improved with these rules:

1. If value is a `string`
   - create `Text`

2. If value is a long text field like `title`, `subtitle`, or `description`
   - create `StructuredText`

3. If value is an `array of objects`
   - create a `Group` field
   - generate child fields from the first object shape

4. If value is a nested object
   - decide whether it belongs in `Main` or a separate tab

## Fix needed for tab handling

Current logic:

- `passenger.first_name` -> tab becomes `Passenger`

Recommended logic for this project:

- keep simple page/domain fields in `Main`
- use tabs only when the team intentionally defines content sections

That means for this case:

- `first_name` should be in `Main`
- `last_name` should be in `Main`
- `us_route` group should be in `Main`

## Recommended rule for this project

Use tabs only when the JSON root contains true UI sections such as:

```json
{
  "hero": {},
  "seo": {},
  "footer": {}
}
```

Do not create a new tab just because the root key is the document name like:

```json
{
  "passenger": {}
}
```

In that case, keep it in `Main`.

## Summary

For the passenger JSON:

- `Passenger` tab is not ideal
- `us_route` should be a `Group`
- the generator must be updated to understand arrays of objects
- the tab logic should not create a new tab when the first key is just the
  document name
