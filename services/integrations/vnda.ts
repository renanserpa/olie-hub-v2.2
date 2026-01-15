// Mock service for VNDA
export const vndaService = {
  getCustomerByEmail: async (email: string) => {
    console.log(`[VNDA] Fetching customer: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: 'vnda_12345',
      lifetime_value: 1250.00,
      last_order: '2023-10-15'
    };
  }
};
