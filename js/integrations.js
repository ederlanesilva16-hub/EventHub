/* Integrações externas utilizadas pelo EventHub. */
const Integrations = {
  async buscarCep(cep) {
    const clean = String(cep).replace(/\D/g, "");
    if (clean.length !== 8) throw new Error("Informe um CEP com 8 números.");
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`);
    if (!response.ok) throw new Error("CEP não encontrado ou serviço indisponível.");
    return response.json();
  },
  async buscarCidadeNinjas(cidade, pais = "Brazil") {
    const key = localStorage.getItem("eventhub_ninjas_key");
    if (!key) throw new Error("Cadastre sua chave da API Ninjas em Configurações.");
    const params = new URLSearchParams({ city: cidade, country: pais });
    const response = await fetch(`https://api.api-ninjas.com/v1/geocoding?${params}`, {
      headers: { "X-Api-Key": key }
    });
    if (!response.ok) throw new Error("Não foi possível consultar a API Ninjas. Verifique sua chave e os limites do plano.");
    return response.json();
  }
};
