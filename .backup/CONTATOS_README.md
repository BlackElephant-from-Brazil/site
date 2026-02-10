# Sistema de Contatos - BlackElephant

## Como Funciona

Quando um visitante preenche o formulário de contato, as informações são automaticamente salvas no **LocalStorage** do navegador.

## Como Acessar os Contatos Salvos

### Opção 1: Pelo Console do Navegador

1. Abra o site no navegador
2. Pressione `F12` para abrir o DevTools
3. Vá até a aba **Console**
4. Digite o comando:
   ```javascript
   localStorage.getItem('blackelephant_contacts')
   ```
5. Você verá todos os contatos em formato JSON

### Opção 2: Exportar Todos os Contatos em Arquivo JSON

1. Abra o site no navegador
2. Pressione `F12` para abrir o DevTools
3. Vá até a aba **Console**
4. Digite o comando:
   ```javascript
   exportContacts()
   ```
5. Um arquivo JSON será baixado automaticamente com todos os contatos

### Opção 3: Ver na Aba Application (DevTools)

1. Abra o DevTools (`F12`)
2. Vá até a aba **Application** (ou **Aplicação** em português)
3. No menu lateral esquerdo, expanda **Local Storage**
4. Clique na URL do site
5. Procure pela chave `blackelephant_contacts`
6. Você verá todos os contatos salvos

## Estrutura dos Dados

Cada contato salvo contém:
- **name**: Nome do cliente
- **email**: Email do cliente
- **phone**: Telefone (se informado)
- **message**: Mensagem enviada
- **timestamp**: Data/hora em formato ISO
- **date**: Data/hora formatada em português

## Exemplo de Dados

```json
[
  {
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(19) 99999-9999",
    "message": "Gostaria de fazer um orçamento",
    "timestamp": "2025-12-30T12:34:56.789Z",
    "date": "30/12/2025 09:34:56"
  }
]
```

## Migração para Servidor (Futuro)

Se você quiser migrar para um sistema com backend no futuro, basta:

1. Exportar os contatos atuais usando `exportContacts()`
2. Configurar um backend (Node.js, PHP, etc.)
3. Modificar o arquivo `js/main.js` para enviar os dados via API
4. Importar os contatos exportados para o banco de dados

## Observação Importante

⚠️ Os dados ficam salvos apenas no **navegador local** onde o formulário foi preenchido. Para ter acesso centralizado a todos os contatos de diferentes visitantes, será necessário implementar um backend com banco de dados.
