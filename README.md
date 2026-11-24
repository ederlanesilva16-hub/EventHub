# EventHub Corporate

**Gestão inteligente de eventos corporativos.** O EventHub é um MVP web acadêmico que reúne, em uma interface, o planejamento de eventos, o controle de vagas e o acompanhamento de participantes.

## Problema e proposta

Organizadores de empresas, instituições de ensino e produtoras podem depender de planilhas, formulários, anotações e canais de comunicação separados para cuidar de um mesmo evento. Essa dispersão dificulta encontrar informações atualizadas, acompanhar inscrições e controlar a capacidade.

O EventHub propõe centralizar essas tarefas: a pessoa organizadora entra no painel, cadastra o evento, associa palestrantes, acompanha participantes e inscrições e consulta indicadores e relatórios. A proposta é reduzir trabalho manual e facilitar o acompanhamento da equipe.

## Público-alvo

- Organizadores de eventos corporativos e empresariais.
- Empresas, escolas, universidades e centros de treinamento.
- Produtores de eventos culturais e organizadores independentes.

## O que o MVP oferece

- Login demonstrativo com controle para mostrar ou ocultar a senha.
- Dashboard com indicadores, gráfico de inscrições, próximos eventos e atividade recente.
- Cadastro, edição, pesquisa, filtro, detalhes e exclusão de eventos.
- Listas de eventos e participantes com DataTables (pesquisa, ordenação e paginação).
- Cadastro de participantes com CPF, e-mail e telefone; bloqueio de CPF e inscrição duplicados.
- Controle de capacidade, inscrições, cancelamentos e check-in.
- Cadastro de palestrantes e programação de atividades.
- Detalhes do evento com vagas, palestrantes e previsão do tempo salva.
- Relatórios de ocupação, check-in e receita estimada, com exportação CSV.
- Tema claro/escuro persistido no navegador.
- Notificações de sucesso e erro nas operações.
- Consulta de CEP pela BrasilAPI.

## Requisitos da atividade

| Requisito | Situação no MVP |
|---|---|
| Login e mostrar/ocultar senha | Login demonstrativo; credenciais fixas para apresentação |
| Criar, editar e excluir eventos | Implementado |
| Cadastro e pesquisa de participantes | Implementado; DataTables fornece pesquisa, ordenação e paginação |
| Cadastro de palestrantes | Implementado |
| Dashboard e relatórios | Implementados; relatório exportável em CSV |
| Modo claro/escuro persistente | Implementado com `localStorage` |
| DataTables em eventos e participantes | Implementado |
| Geocodificação com API Ninjas | Implementada; retorna coordenadas e dados do local |
| Previsão com OpenWeatherMap | Implementada; requer as duas chaves e previsão até 5 dias |
| Notificações de sucesso e erro | Implementadas |
| Interface responsiva | Estilos adaptados para telas menores |
| Persistência local | Dados guardados no `localStorage` |
| Carregamento inferior a 3 segundos | Meta do trabalho; ainda não medida |

## Executar

1. Clone ou baixe o repositório.
2. Abra a pasta com um servidor estático, por exemplo, Live Server no VS Code, ou publique no GitHub Pages.
3. Acesse `index.html` pelo servidor.
4. Entre com `admin@eventhub.com` e `123456`.

Não é necessário instalar dependências. jQuery, DataTables, Bootstrap Icons e fontes são carregados por CDN, então é preciso ter conexão com a internet.

## Configurar as APIs

Na tela **Configurações**, salve as chaves abaixo:

- **API Ninjas:** gere uma chave em [api-ninjas.com](https://api-ninjas.com/). Ela geocodifica a cidade e retorna latitude, longitude, estado e país.
- **OpenWeatherMap:** gere uma chave em [openweathermap.org](https://openweathermap.org/api). No formulário de evento, informe a cidade e a data e clique em **Consultar clima da cidade**. O resultado pode ser visto no formulário e nos detalhes do evento.

A integração usa a previsão de 5 dias em intervalos de 3 horas, por coordenadas. A previsão só pode ser exibida quando a data do evento está dentro desse período. As chaves são armazenadas no `localStorage` para a demonstração; em produção, chaves privadas devem ser mantidas em um backend.

## Fluxo demonstrável

```text
Login → Dashboard → Cadastrar evento → Associar palestrantes
     → Gerenciar participantes e inscrições → Check-in → Relatórios
```

## Tecnologias e estrutura

HTML5, CSS3, JavaScript, DataTables, jQuery, Bootstrap Icons, API Ninjas, OpenWeatherMap e BrasilAPI.

```text
.
├── index.html             # aplicação de página única e suas telas
├── css/
│   └── style.css
├── js/
│   ├── app.js             # navegação, cadastros, dashboard e relatórios
│   └── integrations.js    # chamadas às APIs
├── .gitignore
└── README.md
```

## Escopo e limitações

Este projeto é um MVP de interface. O login é simulado, os dados ficam apenas no navegador e não há backend, banco compartilhado, autenticação real, envio de convites ou processamento de pagamentos. O CPF tem validação de 11 dígitos e duplicidade, mas ainda não valida matematicamente os dígitos verificadores. A previsão do tempo depende de chaves configuradas e da janela de cinco dias da API.

## Texto curto para apresentação

Organizadores de eventos muitas vezes precisam distribuir informações entre planilhas, formulários e anotações, o que dificulta acompanhar participantes e vagas. O EventHub Corporate reúne a gestão em uma plataforma web: permite cadastrar eventos, organizar participantes e palestrantes e acompanhar resultados em um dashboard. Este MVP demonstra o fluxo de gestão; inscrições e dados ainda são locais e não representam uma plataforma de produção.
