# SecurityTokenApi

All URIs are relative to *https://jsonplaceholder.typicode.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createSecurityToken**](SecurityTokenApi.md#createsecuritytoken) | **POST** /api/security-token |  |



## createSecurityToken

> SecurityTokenResponse createSecurityToken()



### Example

```ts
import {
  Configuration,
  SecurityTokenApi,
} from '';
import type { CreateSecurityTokenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SecurityTokenApi();

  try {
    const data = await api.createSecurityToken();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**SecurityTokenResponse**](SecurityTokenResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | A security token cookie has been issued. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

