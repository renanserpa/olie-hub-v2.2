
/**
 * Utilitário de Fetch com Timeout e AbortController
 * Garante que nenhuma requisição fique pendente indefinidamente.
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Tempo limite excedido (10s). O servidor não respondeu.');
    }
    throw error;
  }
}
