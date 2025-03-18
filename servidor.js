const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://josedesen.github.io',
  methods: ['GET', 'POST'],
}))
app.use((req, res, next) => {
  const allowedOrigins = ['https://josedesen.github.io', 'https://josedesen.github.io/quebra-cabeca/quebra_cabeca_nivel1.html'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

const uri = process.env.MONGO_URI;
const porta = process.env.PORT;
const client = new MongoClient(uri);
async function connect() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1); // Encerra o processo se a conexão falhar
  }
}
connect();
app.post('/pontuacao', async (req, res) => {
  try {
    const { nome, pontuacao } = req.body;
    if (!nome || !tempo || typeof tempo !== 'number') {
      return res.status(400).json({ erro: 'Dados inválidos: Nome ou tempo ausente ou mal formatado.' });
    }else{
      const collection = client.db('sapo').collection('pontuacoes');
  
      // Obter os 5 melhores tempos ordenados
      const melhoresTempos = await collection.find().sort({ tempo: 1 }).limit(5).toArray();
    
      // Verificar se o tempo é menor que o maior entre os 5 melhores
      if (melhoresTempos.length < 5 || tempo < melhoresTempos[melhoresTempos.length - 1].tempo) {
        // Adicionar o novo tempo
        await collection.insertOne({ nome, tempo });
    
        // Se mais de 5 tempos forem salvos, remover o maior
        if (melhoresTempos.length === 5 ) {
          const maiorTempo = await collection.find().sort({ tempo: -1 }).limit(1).toArray();
        }
        res.json({ mensagem: 'Tempo e nome adicionados com sucesso' });
        }else{
         res.status(304).send('O tempo enviado não é menor que os tempos já registrados');
        }
    }
  } catch (error) {
    console.error('Erro ao adicionar tempo e nome:', error);
    res.status(500).json({erro:'Erro interno no servidor', detalhes: error.menssage});
  }
});

app.get('/pontuacao', async (req, res) => {
  try {
    const collection = client.db('sapo').collection('pontuacoes');
    const tempos = await collection.find().sort({ tempo: 1 }).limit(5).toArray();
    res.json(tempos);
  } catch (error) {
    console.error('Erro ao obter os tempos:', error);
    res.status(500).send('Erro interno no servidor');
  }
});
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});

