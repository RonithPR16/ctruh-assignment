export type ApiRequestOptions<TBody> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: TBody
  headers?: Record<string, string>
  signal?: AbortSignal
}

export const apiRequest = async <TResponse, TBody = unknown>(
  url: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> => {
  const { method = 'GET', data, headers, signal } = options
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const requestInit: RequestInit = {
    method,
    signal,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(headers ?? {}),
    },
  }

  if (data !== undefined) {
    requestInit.body = isFormData ? (data as FormData) : JSON.stringify(data)
  }

  const response = await fetch(url, requestInit)
  if (!response.ok) {
    const fallback = await response.text().catch(() => '')
    throw new Error(fallback || 'Request failed')
  }
  return (await response.json()) as TResponse
}
