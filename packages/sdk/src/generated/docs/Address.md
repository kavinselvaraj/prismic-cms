
# Address


## Properties

Name | Type
------------ | -------------
`street` | string
`suite` | string
`city` | string
`zipcode` | string
`geo` | [Geo](Geo.md)

## Example

```typescript
import type { Address } from ''

// TODO: Update the object below with actual values
const example = {
  "street": null,
  "suite": null,
  "city": null,
  "zipcode": null,
  "geo": null,
} satisfies Address

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Address
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


