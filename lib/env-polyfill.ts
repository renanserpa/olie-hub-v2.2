
/**
 * OlieHub Env Polyfill
 * Garante que 'process.env' não cause erros de referência no navegador.
 */
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || {};
  (window as any).process.env = (window as any).process.env || {};
  
  // Caso o ambiente não tenha injetado as variáveis, tentamos ler do window.__ENV__ 
  // ou mantemos o objeto vazio para evitar crashes.
  const globalEnv = (window as any).__ENV__ || {};
  Object.assign((window as any).process.env, globalEnv);
}

export {};
