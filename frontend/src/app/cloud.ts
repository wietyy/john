export async function getCloud(password: string): Promise<string> {
    const endpoint = "/api/getCloudData";
    const method = "POST";
    const contentType = "Content-Type";
    const jsonType = "application/json";
    const headers = {
      [contentType]: jsonType,
    };
    const requestBody = { password };
    const body = JSON.stringify(requestBody);
    const requestOptions = {
      method: method,
      headers: headers,
      body: body,
    };

    const response = await fetch(endpoint, requestOptions);
    const jsonResponse = await response.json();
    const responseData = jsonResponse.data;
    const data = responseData ?? "";

    return data;
}

export async function setCloud(password: string, data: string): Promise<string> {
    const endpoint = "/api/setCloudData";
    const method = "POST";
    const contentType = "Content-Type";
    const jsonType = "application/json";
    const headers = {
      [contentType]: jsonType,
    };
    const requestBody = { password, data };
    const body = JSON.stringify(requestBody);
    const requestOptions = {
      method: method,
      headers: headers,
      body: body,
    };

    const response = await fetch(endpoint, requestOptions);
    const jsonResponse = await response.json();
    const responseResult = jsonResponse.result;
    const result = responseResult ?? "error";

    return result;
}