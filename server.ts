import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PilatesCore Studio API' });
});

// Endpoint for AI Pilates Session Prescriptions
app.post('/api/gemini/prescribe-session', async (req, res) => {
  try {
    const { studentName, complaints, posturalDiagnosis, restrictions, goals, apparatus, focusObjective } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor. Utilizando prescritor clínico padrão.',
        useFallback: true,
      });
    }

    const prompt = `
Você é uma Fisioterapeuta e Master Instrutora de Pilates com mais de 15 anos de experiência clínica nos métodos Clássico e Contemporâneo.
Elabore uma aula completa e segura de Pilates de 50 minutos para o seguinte aluno:

Nome do Aluno: ${studentName || 'Aluno'}
Queixa Principal / Patologias: ${complaints || 'Sem queixas agudas'}
Diagnóstico Postural: ${posturalDiagnosis || 'Padrão neutro'}
Restrições e Cuidados Obrigatórios: ${restrictions ? JSON.stringify(restrictions) : 'Evitar sobrecarga desnecessária'}
Objetivos da Sessão: ${goals ? JSON.stringify(goals) : 'Fortalecimento de Core e Mobilidade'}
Aparelho(s) Disponível(is): ${apparatus || 'Reformer, Cadillac, Wunda Chair'}
Foco Específico Desta Aula: ${focusObjective || 'Equilíbrio e alívio de tensões'}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "title": "Título conciso da sessão",
  "duration": "50 minutos",
  "studentName": "${studentName}",
  "focus": "Resumo do foco e cuidado",
  "warmup": [
    {
      "name": "Nome do exercício",
      "apparatus": "Aparelho ou Solo",
      "springTension": "Molas específicas (ex: 2 Vermelhas + 1 Azul)",
      "repetitions": "Número de repetições",
      "objective": "Objetivo biomecânico",
      "precautions": "Cuidados e alinhamento"
    }
  ],
  "mainRepertoire": [
    {
      "name": "Nome do exercício",
      "apparatus": "Aparelho",
      "springTension": "Molas específicas",
      "repetitions": "Número de repetições",
      "objective": "Objetivo biomecânico",
      "precautions": "Cuidados essenciais para a patologia do aluno"
    }
  ],
  "cooldown": [
    {
      "name": "Nome do exercício",
      "apparatus": "Aparelho ou Solo",
      "springTension": "Molas ou sem carga",
      "repetitions": "Duração/repetições",
      "objective": "Retorno à calma e descompressão",
      "precautions": "Alinhamento"
    }
  ],
  "clinicalObservations": "Orientações clínicas e sinais de alerta para o instrutor durante a execução"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    const parsed = JSON.parse(outputText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Erro na prescrição Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao processar prescrição com IA',
      useFallback: true,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PilatesCore Server rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
