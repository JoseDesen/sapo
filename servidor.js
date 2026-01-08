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
  const allowedOrigins = ['https://josedesen.github.io', 'https://josedesen.github.io/sapo/'];
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

app.get('/', (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Servidor do Jogo do Sapo rodando!",
    timestamp: new Date().toISOString()
  });
});

app.post('/pontuacao', async (req, res) => {
  try {
    const { nome, pontuacao } = req.body;
    
    if (!nome || !pontuacao || typeof pontuacao !== 'number') {
      return res.status(400).json({ erro: 'Dados inválidos: Nome ou pontuacao ausente ou mal formatado.' });
    }else{
      const collection = client.db('sapo').collection('pontuacoes');
  
      // Obter os 5 melhores pontuacaos ordenados
      const melhorespontuacaos = await collection.find().sort({ pontuacao: 1 }).limit(20).toArray();
      
      // Verificar se a pontuação é maior que o menor entre os melhores
      if (melhorespontuacaos.length < 20 || pontuacao > melhorespontuacaos[0].pontuacao) {
        // Adicionar a nova pontuacao
        await collection.insertOne({ nome, pontuacao });

        
        // Se houver mais de 20 pontuações, remover o menor
        if (melhorespontuacaos.length === 20 ) {
          const maiorpontuacao = await collection.find().sort({ pontuacao: 1 }).limit(1).toArray();
          if (maiorpontuacao.length > 0 && maiorpontuacao[0]._id) {
            await collection.deleteOne({ _id: maiorpontuacao[0]._id });
          }
        }
        res.json({ mensagem: 'pontuacao e nome adicionados com sucesso' });
        }else{
         res.status(304).send('O pontuacao enviado não é menor que os pontuacaos já registrados');
        }
    }
  } catch (error) {
    console.error('Erro ao adicionar pontuacao e nome:', error);
    res.status(500).json({erro:'Erro interno no servidor', detalhes: error.menssage});
  }
});

app.get('/pontuacao', async (req, res) => {
  try {
    const collection = client.db('sapo').collection('pontuacoes');
    const pontuacaos = await collection.find().sort({ pontuacao: -1 }).limit(20).toArray();
    res.json(pontuacaos);
  } catch (error) {
    console.error('Erro ao obter os pontuacaos:', error);
    res.status(500).send('Erro interno no servidor');
  }
});



app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});

