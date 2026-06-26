
# User


## Properties

Name | Type
------------ | -------------
`id` | number
`name` | string
`username` | string
`email` | string
`address` | [Address](Address.md)
`phone` | string
`website` | string
`company` | [Company](Company.md)

## Example

```typescript
import type { User } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "username": null,
  "email": null,
  "address": null,
  "phone": null,
  "website": null,
  "company": null,
} satisfies User

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as User
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


