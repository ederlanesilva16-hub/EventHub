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
    const params = new URLSearchParams({ city: cidade.split(",")[0].trim(), country: pais });
    const response = await fetch(`https://api.api-ninjas.com/v1/geocoding?${params}`, {
      headers: { "X-Api-Key": key }
    });
    if (!response.ok) throw new Error("Não foi possível consultar a API Ninjas. Verifique sua chave e os limites do plano.");
    return response.json();
  },
  async buscarClima(latitude, longitude, dataEvento) {
    const key = localStorage.getItem("eventhub_weather_key");
    if (!key) throw new Error("Cadastre sua chave OpenWeatherMap em Configurações.");
    const params = new URLSearchParams({ lat: latitude, lon: longitude, appid: key, units: "metric", lang: "pt_br" });
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`);
    if (!response.ok) throw new Error(response.status === 401 ? "Chave OpenWeatherMap inválida ou ainda não ativada." : "Não foi possível consultar a previsão do tempo.");
    const forecast = await response.json();
    const timezone = Number(forecast.city?.timezone || 0);
    const day = forecast.list.filter(item => new Date((item.dt + timezone) * 1000).toISOString().slice(0, 10) === dataEvento);
    if (!day.length) throw new Error("A previsão detalhada está disponível apenas para os próximos 5 dias. Consulte novamente perto da data do evento.");
    const temperatures = day.map(item => item.main.temp);
    return {
      description: day[Math.floor(day.length / 2)].weather[0].description,
      icon: day[Math.floor(day.length / 2)].weather[0].icon,
      min: Math.round(Math.min(...temperatures)),
      max: Math.round(Math.max(...temperatures)),
      date: dataEvento
    };
  }
};
