import { ApiError, hash } from './core.ts';
import type { Store } from './core.ts';

export function createRpcStore(): Store {
  async function rpc(name: string, params: Record<string, unknown>) {
    const base = process.env.SHOWMOB_SUPABASE_URL;
    const key = process.env.SHOWMOB_SUPABASE_SERVICE_ROLE_KEY;
    if (!base || !key) throw new ApiError(503, 'Authoring storage is not configured');
    const res = await fetch(`${base.replace(/\/$/, '')}/rest/v1/rpc/showmob_authoring_${name}`, {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({})) as { code?: string };
      if (error.code === 'P0409') throw new ApiError(409, 'Revision or request conflict; read the run and retry with current inputs');
      if (error.code === 'P0404') throw new ApiError(404, 'Run not found');
      if (error.code === '22023') throw new ApiError(400, 'Storage rejected the authoring request');
      throw new ApiError(503, 'Authoring storage unavailable');
    }
    return res.json();
  }
  return {
    start: (workspace, actor, body, snapshot) => rpc('start', { p_workspace: workspace, p_actor: actor, p_request: body.requestId, p_brief: body.brief, p_protocol: snapshot, p_protocol_hash: hash(snapshot) }),
    list: (workspace, query, offset) => rpc('list', { p_workspace: workspace, p_query: query, p_offset: offset }),
    read: (workspace, runId) => rpc('read', { p_workspace: workspace, p_run: runId }),
    steps: (workspace, runId) => rpc('steps', { p_workspace: workspace, p_run: runId }),
    append: (workspace, actor, body) => rpc('append', { p_workspace: workspace, p_actor: actor, p_run: body.runId, p_request: body.requestId, p_expected: body.expectedRevision, p_step: body }),
  };
}
