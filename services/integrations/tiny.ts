import { Customer } from '../../types';

// Mock service for Tiny ERP
export const tinyService = {
  createOrder: async (customer: Customer, items: any[]) => {
    console.log(`[TINY] Creating order for ${customer.full_name}`, items);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      order_id: Math.floor(Math.random() * 100000).toString(),
      status: 'pending'
    };
  },

  searchProduct: async (query: string) => {
    console.log(`[TINY] Searching product: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { sku: 'VEST-001', name: 'Vestido Floral Olie Verão', price: 299.90, stock: 12 },
      { sku: 'BLUSA-002', name: 'Blusa Seda Off-White', price: 159.90, stock: 5 },
      { sku: 'SAIA-003', name: 'Saia Midi Linho', price: 199.90, stock: 0 },
    ];
  }
};
