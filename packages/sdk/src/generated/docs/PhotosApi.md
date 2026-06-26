# PhotosApi

All URIs are relative to *https://jsonplaceholder.typicode.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listAlbumPhotos**](PhotosApi.md#listalbumphotos) | **GET** /albums/{id}/photos |  |
| [**listPhotos**](PhotosApi.md#listphotos) | **GET** /photos |  |



## listAlbumPhotos

> Array&lt;Photo&gt; listAlbumPhotos(id)



### Example

```ts
import {
  Configuration,
  PhotosApi,
} from '';
import type { ListAlbumPhotosRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PhotosApi();

  const body = {
    // number
    id: 56,
  } satisfies ListAlbumPhotosRequest;

  try {
    const data = await api.listAlbumPhotos(body);
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

[**Array&lt;Photo&gt;**](Photo.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Photos for an album. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listPhotos

> Array&lt;Photo&gt; listPhotos(albumId)



### Example

```ts
import {
  Configuration,
  PhotosApi,
} from '';
import type { ListPhotosRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PhotosApi();

  const body = {
    // number (optional)
    albumId: 56,
  } satisfies ListPhotosRequest;

  try {
    const data = await api.listPhotos(body);
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
| **albumId** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Photo&gt;**](Photo.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | A list of photos. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

