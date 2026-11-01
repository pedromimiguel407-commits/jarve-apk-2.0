import express from 'express';
import * as TS from '../services/taskService.mjs';

const router = express.Router();

router.get('/agents', (req, res) => res.json(TS.listAgents()));

router.post('/plan', async (req, res) => {
  const { goal, provider, model } = req.body || {};
  if (!goal) return res.status(400).json({ error: 'goal obrigatorio' });
  try {
    const steps = await TS.createPlan(goal, { provider, model });
    res.json({ goal, steps });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { goal, conversationId, provider, model, autoRun, agentId } = req.body || {};
  if (!goal || typeof goal !== 'string') return res.status(400).json({ error: 'goal obrigatorio' });
  try {
    // Agente escolhido na tela "Agentes": antes o campo era ignorado e o agente era sempre automatico.
    let steps;
    if (agentId) {
      if (!TS.listAgents().some(a => a.id === agentId)) return res.status(400).json({ error: 'agentId desconhecido' });
      steps = [{ title: goal.slice(0, 200), agent: agentId, dependsOn: [] }];
    } else steps = await TS.createPlan(goal, { provider, model });
    const task = TS.createTask({ goal, conversationId, plan: steps });
    if (autoRun) {
      // fire and forget
      TS.runTask({ taskId: task.id, context: { provider, model } }).catch(e => console.error('[task]', e.message));
    }
    res.status(201).json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', (req, res) => res.json(TS.listTasks(Number(req.query.limit) || 50)));

router.get('/:id', (req, res) => {
  const t = TS.getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'Tarefa nao encontrada' });
  res.json(t);
});

router.post('/:id/run', async (req, res) => {
  const { provider, model } = req.body || {};
  try {
    const t = await TS.runTask({ taskId: req.params.id, context: { provider, model } });
    res.json(t);
  } catch (e) { res.status(e.status || (/nao encontrada/i.test(e.message) ? 404 : 500)).json({ error: e.message }); }
});

router.post('/:id/cancel', (req, res) => {
  const t = TS.cancelTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'Tarefa nao encontrada' });
  res.json(t);
});

export default router;
