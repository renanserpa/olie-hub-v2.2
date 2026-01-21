
import { NextResponse } from 'next/server';

const TINY_API_URL = 'https://api.tiny.com.br/api2';

/**
 * TinyClient - Production Gateway
 */
export class TinyClient {
  private token: string;

  constructor(token?: string) {
    this.token = token?.trim() || process.env.TINY_API_TOKEN || '';
  }

  async post(endpoint: string, extraParams: Record<string, string> = {}) {
    if (!this.token) {
      throw new Error('Token de API do Tiny ERP não configurado em process.env.');
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
