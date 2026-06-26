# TodosApi

All URIs are relative to *https://jsonplaceholder.typicode.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getTodo**](TodosApi.md#gettodo) | **GET** /todos/{id} |  |
| [**listTodos**](TodosApi.md#listtodos) | **GET** /todos |  |



## getTodo

> Todo getTodo(id)



### Example

```ts
import {
  Configuration,
  TodosApi,
} from '';
import type { GetTodoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TodosApi();

  const body = {
    // number
    id: 56,
  } satisfies GetTodoRequest;

  try {
    const data = await api.getTodo(body);
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

[**Todo**](Todo.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | A todo. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTodos

> Array&lt;Todo&gt; listTodos(userId, completed)



### Example

```ts
import {
  Configuration,
  TodosApi,
} from '';
import type { ListTodosRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TodosApi();

  const body = {
    // number (optional)
    userId: 56,
    // boolean (optional)
    completed: true,
  } satisfies ListTodosRequest;

  try {
    const data = await api.listTodos(body);
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
| **completed** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Todo&gt;**](Todo.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | A list of todos. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

