# AlbumsApi

All URIs are relative to *https://jsonplaceholder.typicode.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getAlbum**](AlbumsApi.md#getalbum) | **GET** /albums/{id} |  |
| [**listAlbums**](AlbumsApi.md#listalbums) | **GET** /albums |  |



## getAlbum

> Album getAlbum(id)



### Example

```ts
import {
  Configuration,
  AlbumsApi,
} from '';
import type { GetAlbumRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AlbumsApi();

  const body = {
    // number
    id: 56,
  } satisfies GetAlbumRequest;

  try {
    const data = await api.getAlbum(body);
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

[**Album**](Album.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | An album. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listAlbums

> Array&lt;Album&gt; listAlbums(userId)



### Example

```ts
import {
  Configuration,
  AlbumsApi,
} from '';
import type { ListAlbumsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AlbumsApi();

  const body = {
    // number (optional)
    userId: 56,
  } satisfies ListAlbumsRequest;

  try {
    const data = await api.listAlbums(body);
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
| **userId** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Album&gt;**](Album.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | A list of albums. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

