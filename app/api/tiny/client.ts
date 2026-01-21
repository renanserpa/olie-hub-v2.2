import { NextResponse } from 'next/server';
import { ENV } from '../../lib/env.ts';

const TINY_API_URL = 'https://api.tiny.com.br/api2';

/**
 * TinyClient - OlieHub Server-Side Gateway
 * Gerencia a comunicação autenticada com o ERP Tiny via API 2.0.
 */
export class TinyClient {
  private token: string;

  constructor(token?: string) {
    // Tenta usar o token passado, senão busca na constante ENV
    this.token = token?.trim() || ENV.TINY_API_TOKEN || '';
  }

  /**
   * Executa uma requisição POST utilizando URLSearchParams (exigência do Tiny)
   */
  async post(endpoint: string, extraParams: Record<string, string> = {}) {
    if (!this.token) {
      throw new Error('Token de API do Tiny ERP não configurado em lib/env.ts.');
    }

    const params = new URLSearchParams();
    params.append('token', this.token);
    params.append('formato', 'JSON');
    
    Object.entries(extraParams).forEach(([key, value]) => {
      params.append(key, value);
    });

    try {
      const response = await fetch(`${TINY_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta do Gateway Tiny (HTTP ${response.status})`);
      }

      const data = await response.json();

      if (data.retorno?.status === 'Erro') {
        const error = data.retorno.erros?.[0];
        if (error?.codigo === '20') {
          return { status: 'empty', data: [] };
        }
        throw new Error(error?.erro || 'Erro desconhecido no ERP Tiny.');
      }

      return { status: 'success', data: data.retorno };
    } catch (err: any) {
      throw new Error(err.message || 'Não foi possível conectar ao Tiny ERP.');
    }
  }
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ 
    status: 'error', 
    message 
  }, { status });
}