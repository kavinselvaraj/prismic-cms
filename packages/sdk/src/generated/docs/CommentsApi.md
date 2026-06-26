# CommentsApi

All URIs are relative to *https://jsonplaceholder.typicode.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listComments**](CommentsApi.md#listcomments) | **GET** /comments |  |
| [**listPostComments**](CommentsApi.md#listpostcomments) | **GET** /posts/{id}/comments |  |



## listComments

> Array&lt;Comment&gt; listComments(postId)



### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '';
import type { ListCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CommentsApi();

  const body = {
    // number (optional)
    postId: 56,
  } satisfies ListCommentsRequest;

  try {
    const data = await api.listComments(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **postId** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Comment&gt;**](Comment.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | A list of comments. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listPostComments

> Array&lt;Comment&gt; listPostComments(id)



### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '';
import type { ListPostCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CommentsApi();

  const body = {
    // number
    id: 56,
  } satisfies ListPostCommentsRequest;

  try {
    const data = await api.listPostComments(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

[**Array&lt;Comment&gt;**](Comment.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Comments for a post. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

