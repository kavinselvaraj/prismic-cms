import * as runtime from "@repo/sdk";

export type ErrorScenarioRequest = {
  status: number;
};

export type ErrorScenarioResponse = {
  detail: string;
  error: string;
  status: number;
};

export class ErrorScenariosApi extends runtime.BaseAPI {
  async simulateErrorScenarioRequestOpts(
    requestParameters: ErrorScenarioRequest,
  ): Promise<runtime.RequestOpts> {
    return {
      headers: {
        Accept: "application/json",
      },
      method: "GET",
      path: `/api/error-demo/${requestParameters.status}`,
      query: {},
    };
  }

  async simulateErrorScenarioRaw(
    requestParameters: ErrorScenarioRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ErrorScenarioResponse>> {
    const requestOptions =
      await this.simulateErrorScenarioRequestOpts(requestParameters);
    const response = await this.request(requestOptions, initOverrides);

    return new runtime.JSONApiResponse(
      response,
      (jsonValue) => jsonValue as ErrorScenarioResponse,
    );
  }

  async simulateErrorScenario(
    requestParameters: ErrorScenarioRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ErrorScenarioResponse> {
    const response = await this.simulateErrorScenarioRaw(
      requestParameters,
      initOverrides,
    );

    return response.value();
  }
}
