export const ApiStore = {
  api: 'http://localhost:5000/',
  possibleEndpoints: [
    'auth',
    'products',
    'cart',
    'comments',
    'favorites',
    'psw_ret',
    'orders',
    'product_request',
    'user',
    'chat'
  ],
  /**
   * this function merges the possible route endpoints with the api url 
   * @param endpoint 
   * @param points 
   * @returns 
   */
  mergeEndpoint: (endpoint: string, ...points: string[]) => {
    return (
      ApiStore.api +
      ApiStore.possibleEndpoints.find((value) => value == endpoint) +
      '/' +
      points.join('/')
    );
  },
};
