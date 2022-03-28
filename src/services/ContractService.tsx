export default class ContractService {
  generateAssetSaleContract = async (
    seller: string,
    asset: number,
    price: number
  ) => {
    try {
      const url = `https://us-central1-mushroom-cloud-api.cloudfunctions.net/asset_sale_contract?seller=${seller}&asset=${asset}&price=${price}`;
      const request = await fetch(url);
      const response = await request.json();
      return response.result;
    } catch (error) {
      throw error;
    }
  };
}
