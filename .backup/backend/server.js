const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Database file path
const DB_FILE = path.join(__dirname, 'contatos.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}

// Helper functions
function readContacts() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler contatos:', error);
    return [];
  }
}

function writeContacts(contacts) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(contacts, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar contatos:', error);
    return false;
  }
}

function getNextId(contacts) {
  if (contacts.length === 0) return 1;
  return Math.max(...contacts.map(c => c.id)) + 1;
}

// API Routes

// GET all contacts
app.get('/api/contatos', (req, res) => {
  try {
    const contatos = readContacts();
    res.json({
      success: true,
      count: contatos.length,
      data: contatos
    });
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contatos'
    });
  }
});

// GET single contact
app.get('/api/contatos/:id', (req, res) => {
  try {
    const contatos = readContacts();
    const contato = contatos.find(c => c.id === parseInt(req.params.id));
    
    if (contato) {
      res.json({
        success: true,
        data: contato
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Contato não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contato'
    });
  }
});

// POST new contact
app.post('/api/contatos', (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e mensagem são obrigatórios'
      });
    }

    const contatos = readContacts();
    const newContact = {
      id: getNextId(contatos),
      name,
      email,
      phone: phone || null,
      message,
      created_at: new Date().toISOString()
    };

    contatos.unshift(newContact); // Add to beginning
    
    if (writeContacts(contatos)) {
      res.status(201).json({
        success: true,
        message: 'Contato salvo com sucesso',
        data: newContact
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar contato'
      });
    }
  } catch (error) {
    console.error('Erro ao salvar contato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar contato'
    });
  }
});

// DELETE contact
app.delete('/api/contatos/:id', (req, res) => {
  try {
    const contatos = readContacts();
    const id = parseInt(req.params.id);
    const filteredContatos = contatos.filter(c => c.id !== id);

    if (filteredContatos.length < contatos.length) {
      writeContacts(filteredContatos);
      res.json({
        success: true,
        message: 'Contato removido com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Contato não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro ao remover contato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover contato'
    });
  }
});

// Export contacts to JSON
app.get('/api/contatos/export/json', (req, res) => {
  try {
    const contatos = readContacts();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=contatos_${Date.now()}.json`);
    res.send(JSON.stringify(contatos, null, 2));
  } catch (error) {
    console.error('Erro ao exportar contatos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar contatos'
    });
  }
});

// Admin page route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🐘 BlackElephant Backend Server                         ║
║  ✓ Servidor rodando na porta ${PORT}                         ║
║  ✓ Banco de dados JSON inicializado                      ║
║                                                           ║
║  📍 API Endpoints:                                        ║
║     GET    /api/contatos           - Listar contatos     ║
║     GET    /api/contatos/:id       - Buscar contato      ║
║     POST   /api/contatos           - Criar contato       ║
║     DELETE /api/contatos/:id       - Remover contato     ║
║     GET    /api/contatos/export/json - Exportar JSON     ║
║                                                           ║
║  🔗 URLs:                                                 ║
║     Site:  http://localhost:${PORT}                          ║
║     Admin: http://localhost:${PORT}/admin                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Servidor encerrado.');
  process.exit(0);
});
