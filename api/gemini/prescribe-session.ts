import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface VercelRequest extends IncomingMessage {
  body: any;
  query: { [key: string]: string | string[] };
  cookies: { [key: string]: string };
}

interface VercelResponse extends ServerResponse {
  send: (body: any) => VercelResponse;
  json: (jsonBody: any) => VercelResponse;
  status: (statusCode: number) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor Vercel. Utilizando prescritor clínico padrão.',
        useFallback: true,
      });
    }

    const { studentName, complaints, posturalDiagnosis, restrictions, goals, apparatus, focusObjective } = req.body || {};

    const ai = new GoogleGenAI({ apiKey });

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
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Erro na função Vercel Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao processar prescrição com IA',
      useFallback: true,
    });
  }
}
