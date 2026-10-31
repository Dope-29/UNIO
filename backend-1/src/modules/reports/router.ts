import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { summary, report, csv } from './service.js';
import { outputFormat, reportKind } from './schema.js';
export const reportsRouter = Router();
reportsRouter.use(authenticate, requireRole('ADMIN', 'STAFF'));
reportsRouter.get('/summary', async (req, res) => res.json({ data: await summary(req.query) }));
reportsRouter.get('/:kind', async (req, res) => {
  const kind = reportKind.parse(req.params.kind);
  const format = outputFormat.parse(req.query.format);
  const result = await report(kind, req.query);
  if (format === 'csv') {
    res.setHeader('X-Total-Count', String(result.total));
    res.type('text/csv').attachment(`${kind}-page-${result.page}.csv`).send(csv(result.data));
  } else res.json(result);
});
