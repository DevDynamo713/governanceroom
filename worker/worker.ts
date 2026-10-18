export interface Env { GOVERNANCEROOM_DO: DurableObjectNamespace; }
export class GovernanceRoomDO {
  private state: DurableObjectState;
  private risks: Map<string, any> = new Map();
  private websockets: WebSocket[] = [];
  constructor(state: DurableObjectState, env: Env) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (url.pathname === '/risks' && request.method === 'GET') {
      return Response.json(Array.from(this.risks.values()));
    }
    if (url.pathname === '/risk' && request.method === 'POST') {
      const data = await request.json();
      this.risks.set(data.id, data);
      this.broadcast(JSON.stringify({ type: 'risk', data: this.risks.get(data.id) }));
      return Response.json({ success: true });
    }
    return new Response('Not Found', { status: 404 });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) { }
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) { this.websockets = this.websockets.filter(w => w !== ws); }
  private broadcast(msg: string) { for (const ws of this.websockets) { if (ws.readyState === 1) ws.send(msg); } }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.GOVERNANCEROOM_DO.idFromName(url.pathname);
    const stub = env.GOVERNANCEROOM_DO.get(id);
    return stub.fetch(request);
  }
}