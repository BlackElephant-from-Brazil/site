# 🐘 BlackElephant - Sistema de Contatos com Backend

Sistema completo de gerenciamento de contatos com backend Node.js e armazenamento em JSON.

## 📋 Requisitos

- **Node.js** (versão 14 ou superior) - [Download aqui](https://nodejs.org)

## 🚀 Início Rápido

### Opção 1: Usar o arquivo BAT (Windows)

1. Dê duplo clique no arquivo: **`INICIAR_SERVIDOR.bat`**
2. Pronto! O servidor irá iniciar automaticamente

### Opção 2: Via Terminal

```bash
cd backend
npm install
npm start
```

O servidor irá iniciar na porta **3000** por padrão.

## 🌐 URLs Disponíveis

Após iniciar o servidor:

- **Site Principal**: http://localhost:3000
- **Painel Admin**: http://localhost:3000/admin
- **API Base**: http://localhost:3000/api/contatos

## 📡 API Endpoints

### GET /api/contatos
Lista todos os contatos salvos.

**Resposta:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### GET /api/contatos/:id
Busca um contato específico por ID.

### POST /api/contatos
Cria um novo contato.

**Body (JSON):**
```json
{
  "name": "Nome do Cliente",
  "email": "email@exemplo.com",
  "phone": "(19) 99999-9999",
  "message": "Mensagem do cliente"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Contato salvo com sucesso",
  "data": { ... }
}
```

### DELETE /api/contatos/:id
Remove um contato pelo ID.

### GET /api/contatos/export/json
Exporta todos os contatos em formato JSON (download automático).

## 💾 Banco de Dados

Os dados são armazenados em um arquivo JSON localizado em:
```
backend/contatos.json
```

### Estrutura de Cada Contato:

```json
{
  "id": 1,
  "name": "Nome do Cliente",
  "email": "email@exemplo.com",
  "phone": "(19) 99999-9999",
  "message": "Mensagem do cliente",
  "created_at": "2025-12-30T12:34:56.789Z"
}
```

## 🎨 Painel Admin

Acesse **http://localhost:3000/admin** para:

- ✅ Ver todos os contatos recebidos
- 📊 Estatísticas (total, hoje, esta semana)
- 👁️ Ver detalhes completos de cada contato
- 🗑️ Remover contatos
- 📥 Exportar todos os contatos em JSON
- 🔄 Atualizar lista em tempo real

## 🔧 Como Funciona

### Frontend (Site)
1. Usuário preenche o formulário de contato
2. JavaScript envia os dados via `fetch()` para a API
3. Exibe alerta de sucesso ou erro
4. Formulário é resetado

### Backend (Servidor)
1. Recebe a requisição POST em `/api/contatos`
2. Valida os dados obrigatórios
3. Salva no banco SQLite
4. Retorna resposta JSON

### Admin (Painel)
1. Carrega contatos via GET `/api/contatos`
2. Renderiza em tabela com estatísticas
3. Permite visualização, exportação e remoção

## 🛡️ Segurança

**IMPORTANTE:** Este é um servidor básico para desenvolvimento/uso local.

Para uso em produção, considere adicionar:
- ✅ Autenticação no painel admin
- ✅ HTTPS/SSL
- ✅ Rate limiting
- ✅ Validação mais rigorosa
- ✅ Sanitização de inputs
- ✅ Proteção contra SQL injection (já implementado com prepared statements)

## 📝 Logs

O servidor exibe logs no console:
- Requisições recebidas
- Erros de banco de dados
- Operações realizadas

## 🔄 Backup

Para fazer backup dos contatos, você pode:

1. **Copiar o arquivo JSON**:
   ```bash
   copy backend\contatos.json backend\contatos_backup.json
   ```

2. **Exportar via Admin**:
   - Acesse http://localhost:3000/admin
   - Clique em "Exportar JSON"

3. **Via API**:
   - Abra http://localhost:3000/api/contatos/export/json no navegador

## 🚫 Solução de Problemas

### Erro: "Cannot find module 'express'"
```bash
cd backend
npm install
```

### Erro: "Port 3000 is already in use"
Mude a porta no arquivo `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Mude para 3001 ou outra porta
```

### Formulário não envia
Verifique se:
1. O servidor está rodando (`npm start` no backend)
2. A URL da API está correta no `js/main.js` (http://localhost:3000)
3. O console do navegador para ver erros

## 📦 Estrutura de Arquivos

```
site/
├── backend/
│   ├── server.js          # Servidor Node.js
│   ├── package.json       # Dependências
│   └── contatos.json     # Banco de dados JSON (criado automaticamente)
├── INICIAR_SERVIDOR.bat  # Atalho para iniciar (Windows)
├── admin.html            # Painel administrativo
├── index.html            # Página principal
├── css/
│   └── main.css
├── js/
│   └── main.js           # Lógica do frontend
└── README_BACKEND.md     # Este arquivo
```

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar autenticação no admin
- [ ] Sistema de tags/categorias para contatos
- [ ] Envio de email automático
- [ ] Integração com CRM
- [ ] Dashboard com gráficos
- [ ] Busca e filtros avançados

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:
1. Se o Node.js está instalado: `node --version`
2. Se as dependências foram instaladas: `npm list`
3. Logs do servidor no terminal
4. Console do navegador (F12)
