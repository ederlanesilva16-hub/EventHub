# EventHub

Aplicação web acadêmica para organizar eventos, participantes, inscrições, palestrantes e programação em uma interface única.

## Executar

1. Clone ou baixe este repositório.
2. Abra a pasta em um servidor estático, como Live Server no VS Code, ou publique no GitHub Pages.
3. Entre com o usuário demonstrativo `admin@eventhub.com` e a senha `123456`.

O projeto não exige instalação de dependências. Bootstrap Icons, DataTables e jQuery são carregados por CDN, então o navegador precisa de internet.

## Funcionalidades

- Login demonstrativo com mostrar/ocultar senha.
- Dashboard com indicadores, inscrições, próximos eventos e atividade recente.
- Cadastro, edição, pesquisa, filtros, detalhes e exclusão de eventos.
- DataTables para eventos e participantes, com pesquisa, ordenação e paginação.
- Cadastro de participantes com CPF, e-mail e telefone; impede CPF e inscrições duplicadas.
- Controle de inscrições, capacidade, cancelamento e check-in.
- Cadastro e gestão de palestrantes e programação.
- Relatórios com ocupação, check-ins, receita estimada e exportação CSV.
- Tema claro/escuro persistido no `localStorage`.
- Integrações BrasilAPI para CEP, API Ninjas para geocodificação e OpenWeatherMap para previsão.
- Dados demonstrativos persistidos no `localStorage` do navegador.

## Configurar APIs

Abra **Configurações** no sistema e salve as chaves:

- **API Ninjas:** crie uma chave em [api-ninjas.com](https://api-ninjas.com/). É usada para encontrar as coordenadas da cidade.
- **OpenWeatherMap:** crie uma chave em [openweathermap.org](https://openweathermap.org/api). É usada para consultar previsão do tempo.

No cadastro/edição de evento, preencha cidade e data e selecione **Consultar clima da cidade**. A previsão é exibida no formulário e salva junto ao evento para consulta em **Detalhes**. A API gratuita de previsão de 5 dias oferece dados em intervalos de 3 horas; por isso o evento precisa ocorrer nos próximos 5 dias para retornar a previsão. A consulta de CEP não exige chave.

As chaves ficam no `localStorage` para facilitar a demonstração acadêmica. Em produção, chaves privadas devem ficar em um backend e não no navegador.

## Estrutura

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── integrations.js
├── .gitignore
└── README.md
```

## Limitações

Este é um MVP front-end: login demonstrativo, dados locais no navegador e sem backend ou autenticação real. O CPF tem validação de tamanho e duplicidade, mas a validação matemática dos dígitos verificadores ainda não foi implementada. Os dados locais não são compartilhados entre dispositivos ou usuários.
