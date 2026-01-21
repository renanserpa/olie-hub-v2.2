
import { NextResponse } from 'next/server';
import { OrderService, SyncService } from '../../../services/api.ts';

/**
 * GET /api/admin/sync
 * Único ponto de entrada para gatilhos manuais de sincronização total.
 */
export async function GET() {
  try {
    const results = await Promise.allSettled([
      SyncService.syncOrders(),
      SyncService.syncProducts(),
      SyncService.syncCustomers()
    ]);

    const report = results.map((res, idx) => {
      const names = ['Pedidos', 'Produtos', 'Clientes'];
      if (res.status === 'fulfilled') {
        return { type: names[idx], status: 'success', result: res.value };
      } else {
        return { type: names[idx], status: 'error', message: res.reason?.message || 'Erro desconhecido' };
      }
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'completed',
      results: report
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erro fatal no processo de sincronização', 
      details: error.message 
    }, { status: 500 });
  }
}
