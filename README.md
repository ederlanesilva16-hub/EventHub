# EventHub

Sistema web para gestão de eventos, desenvolvido como projeto acadêmico com HTML, CSS e JavaScript.

## Objetivo

Centralizar a criação de eventos, inscrições, participantes e palestrantes em uma única interface, reduzindo o uso de planilhas e controles dispersos.

## Funcionalidades

- Login demonstrativo com opção para mostrar ou ocultar a senha.
- Dashboard com indicadores de eventos e inscrições.
- Cadastro, edição, pesquisa e exclusão de eventos.
- Gerenciamento de participantes, inscrições e check-in com DataTables.
- Cadastro de palestrantes e programação.
- Relatórios com exportação CSV.
- Tema claro e escuro salvo no `localStorage`.
- Consulta de CEP pela BrasilAPI.
- Consulta de geocodificação de cidades pela API Ninjas.
- Persistência de dados no navegador com `localStorage`.

## Tecnologias

HTML5, CSS3, JavaScript, Bootstrap Icons, DataTables, BrasilAPI e API Ninjas.

## Executar localmente

1. Clone este repositório.
2. Abra a pasta no VS Code e inicie um servidor local (por exemplo, Live Server).
3. Acesse `index.html` pelo endereço local.
4. Credenciais demonstrativas: `admin@eventhub.com` / `123456`.

As bibliotecas visuais são carregadas por CDN, então a conexão com a internet é necessária.

## Configuração da API Ninjas

Crie uma chave em [API Ninjas](https://api-ninjas.com/), abra Configurações no sistema e informe a chave. Para este MVP, a chave fica no `localStorage` do navegador. Em produção, chamadas que usam chave privada devem passar por um backend.

## Estrutura

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── integrations.js
└── README.md
```

## Escopo e limitações

Este projeto é um MVP front-end. O login é demonstrativo e os dados ficam no navegador; não há backend, banco de dados ou autenticação real. A previsão do tempo via OpenWeatherMap prevista na proposta acadêmica ainda precisa ser integrada.
