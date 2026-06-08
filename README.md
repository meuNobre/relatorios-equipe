# MyFeedback

MyFeedback é um MVP de gestão de avaliações no Discord com geração automática de relatórios visuais.

O projeto saiu de um gerador local de imagens e virou uma base de SaaS simples:

- o **bot Discord** controla ciclos, membros, departamentos, gestores e avaliações;
- o **SQLite** guarda os dados;
- a **API Python/FastAPI** só gera a imagem final do relatório usando o renderizador antigo em Pillow.

## Estrutura

```text
.
├── bot/                 # Bot Discord em JavaScript puro
├── render_api/          # API Python/FastAPI para gerar PNG
├── render/              # Renderizadores Pillow do projeto original
├── models/              # Models Python reaproveitados pela API
├── services/            # Serviços Python legados + render_png
├── assets/              # Imagens/medalhas
├── fonts/               # Fontes usadas no relatório
└── requirements.txt     # Dependências Python
```

## Requisitos para testar em outro PC

Instale antes:

- Python 3.11 ou superior;
- Node.js 24 ou superior;
- Git;
- uma aplicação/bot criada no Discord Developer Portal.

> O bot usa o SQLite nativo do Node 24 (`node:sqlite`), então não precisa compilar `better-sqlite3`.

## 1. Baixar o projeto

```bash
git clone <url-do-repositorio>
cd relatorio
```

## 2. Instalar e subir a API Python

Na raiz do projeto:

```bash
pip install -r requirements.txt
python -m uvicorn render_api.app:app --reload
```

Teste se a API está online:

```bash
curl http://localhost:8000/health
```

Resposta esperada:

```json
{"status":"ok"}
```

A API precisa ficar ligada enquanto o bot estiver gerando relatórios.

## 3. Configurar o bot Discord

Abra outro terminal:

```bash
cd bot
npm install
cp .env.example .env
```

No Windows PowerShell, se `cp` não funcionar:

```powershell
Copy-Item .env.example .env
```

Preencha o arquivo `bot/.env`:

```text
DISCORD_TOKEN=token_do_seu_bot
DISCORD_CLIENT_ID=id_da_aplicacao_do_bot
DISCORD_GUILD_ID=id_do_servidor_discord
DATABASE_PATH=./data/myfeedback.sqlite
RENDER_API_URL=http://localhost:8000
```

### Onde pegar cada valor

- `DISCORD_TOKEN`: token do bot no Discord Developer Portal.
- `DISCORD_CLIENT_ID`: Application ID do bot.
- `DISCORD_GUILD_ID`: ID do servidor onde você vai testar.
- `DATABASE_PATH`: pode deixar como está.
- `RENDER_API_URL`: pode deixar como está se a API Python estiver local.

## 4. Criar banco e tabelas

Dentro da pasta `bot`:

```bash
npm run migrate
```

Isso cria automaticamente o SQLite em `bot/data/myfeedback.sqlite` e aplica as tabelas de:

- servidores;
- departamentos;
- membros;
- relação membro/departamento;
- cargos gestores;
- ciclos de avaliação;
- avaliações;
- notas;
- relatórios.

## 5. Opcional: importar JSON legado

Se quiser importar os membros atuais de `data/members.json`:

```bash
npm run seed:json
```

Esse comando cria membros, departamentos e vínculos no SQLite com base no JSON antigo.

## 6. Iniciar o bot

Ainda dentro de `bot`:

```bash
npm start
```

Se estiver tudo certo, os slash commands serão registrados no servidor definido em `DISCORD_GUILD_ID`.

## 7. Fluxo manual para testar no Discord

### 7.1 Criar departamentos

Use exemplos como:

```text
/department add nome:RH
/department add nome:Moderação
```

### 7.2 Cadastrar cargo gestor

Escolha uma role do Discord que poderá avaliar aquele departamento:

```text
/department manager add departamento:RH cargo:@GestorRH
/department manager add departamento:Moderação cargo:@GestorModeração
```

A pessoa que usar `/evaluate` precisa ter a role gestora do departamento avaliado.

### 7.3 Cadastrar membro

Exemplo de membro em dois departamentos:

```text
/member add nickname:Nuggeets_ cargo:Suporte entrada:2025-02-24 departamentos:RH, Moderação
```

### 7.4 Abrir ciclo

```text
/cycle open nome:Junho/2026
```

Ver status:

```text
/cycle status
```

### 7.5 Enviar avaliação parcial

Para RH:

```text
/evaluate nickname:Nuggeets_ departamento:RH realizacao_de_atividades:Excelente frequencia:Bom comunicacao:Excelente nota_do_gestor:Excelente
```

Como o membro também está em Moderação, o bot deve responder que ainda falta avaliação.

### 7.6 Enviar última avaliação e gerar relatório

Para Moderação:

```text
/evaluate nickname:Nuggeets_ departamento:Moderação realizacao_de_atividades:Excelente frequencia:Excelente comunicacao:Bom nota_do_gestor:Excelente
```

Quando todos os departamentos do membro forem avaliados no ciclo, o bot deve:

1. montar o payload;
2. chamar `POST /reports/render` na API Python;
3. salvar o PNG em `bot/data/reports/`;
4. registrar o relatório no SQLite;
5. enviar o arquivo no Discord.

## Comandos disponíveis no MVP

```text
/cycle open
/cycle status
/cycle close
/department add
/department manager add
/member add
/member info
/evaluate
/report status
/report regenerate
```

Observação: `/report status` e `/report regenerate` já existem como comandos reservados, mas a geração principal do MVP acontece automaticamente após `/evaluate`.

## Regra principal

Um relatório só é gerado quando **cada departamento ativo do membro** tem uma avaliação enviada no **ciclo aberto**.

Exemplo:

- Membro participa de RH e Moderação.
- Avaliação de RH foi enviada.
- Avaliação de Moderação ainda não foi enviada.
- Resultado: relatório ainda não gera.

Quando RH e Moderação estiverem avaliados no mesmo ciclo, o relatório é gerado automaticamente.

## Teste direto da API de renderização

Com a API Python ligada, você também pode testar sem Discord:

```bash
curl -X POST http://localhost:8000/reports/render \
  -H "Content-Type: application/json" \
  --output report.png \
  -d '{
    "cycle": { "id": "2026-06", "name": "Junho/2026" },
    "member": {
      "id": "1",
      "nickname": "Nuggeets_",
      "role": "Suporte",
      "date_joined": "2025-02-24",
      "departments": ["RH", "Moderação"]
    },
    "feedbacks": [
      {
        "department": "RH",
        "notes": {
          "Realização de Atividades": "Excelente",
          "Frequência": "Bom",
          "Comunicação": "Excelente",
          "Nota do Gestor": "Excelente"
        }
      }
    ]
  }'
```

Se funcionar, será criado um arquivo `report.png`.

## Arquivos que não devem ir para o GitHub

O `.gitignore` já ignora:

- `node_modules/`;
- `.env`;
- logs;
- banco SQLite gerado;
- PNGs gerados em `bot/data/reports/`;
- caches Python.

Suba apenas o código, migrations, assets, fontes e exemplos seguros.
;