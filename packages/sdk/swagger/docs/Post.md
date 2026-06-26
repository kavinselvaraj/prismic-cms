
# Post


## Properties

Name | Type
------------ | -------------
`userId` | number
`id` | number
`title` | string
`body` | string

## Example

```typescript
import type { Post } from ''

// TODO: Update the object below with actual values
const example = {
  "userId": null,
  "id": null,
  "title": null,
  "body": null,
} satisfies Post

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Post
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


