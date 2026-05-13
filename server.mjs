// server.mjs - ES Module 后端，提供 /api/execute 和 /api/status/:id
import http from 'http';

const executions = new Map();

// 拓扑排序
function topologicalSort(nodes, edges) {
  const inDeg = new Map();
  const adj = new Map();
  nodes.forEach(n => { inDeg.set(n.id, 0); adj.set(n.id, []); });
  edges.forEach(e => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source).push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
    }
  });
  const q = [];
  inDeg.forEach((d, id) => { if (d === 0) q.push(id); });
  const order = [];
  while (q.length) {
    const curr = q.shift();
    order.push(curr);
    (adj.get(curr) || []).forEach(nxt => {
      inDeg.set(nxt, inDeg.get(nxt) - 1);
      if (inDeg.get(nxt) === 0) q.push(nxt);
    });
  }
  nodes.forEach(n => { if (!order.includes(n.id)) order.push(n.id); });
  return order;
}

// 模拟执行单个节点
function execNode(node) {
  const delay = Math.floor(Math.random() * 1500) + 500;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        nodeId: node.id,
        nodeType: node.type,
        label: (node.data && node.data.label) || node.id,
        result: `✅ ${(node.data && node.data.label) || node.id} 执行完成`,
        timestamp: new Date().toISOString(),
      });
    }, delay);
  });
}

// 异步执行工作流
function runExec(execId, nodes, edges) {
  const ex = executions.get(execId);
  if (!ex) return;
  ex.status = 'running';
  ex.progress = 0;

  const order = topologicalSort(nodes, edges);
  let done = 0;
  const total = order.length;

  async function step(i) {
    if (i >= order.length) {
      ex.status = 'completed';
      ex.progress = 100;
      return;
    }
    const nid = order[i];
    const node = nodes.find(n => n.id === nid);
    if (!node) { done++; step(i + 1); return; }
    try {
      const out = await execNode(node);
      ex.results.push({ nodeId: nid, status: 'completed', output: out });
    } catch (e) {
      ex.results.push({ nodeId: nid, status: 'error', error: String(e) });
    }
    done++;
    ex.progress = Math.round((done / total) * 100);
    setTimeout(() => step(i + 1), 100);
  }
  step(0);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // POST /api/execute
  if (pathname === '/api/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { nodes, edges } = JSON.parse(body);
        const execId = 'exec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        executions.set(execId, { status: 'pending', progress: 0, results: [] });
        runExec(execId, nodes, edges);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ executionId: execId, status: 'pending' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // GET /api/status/:id
  const m = pathname.match(/^\/api\/status\/([^/]+)$/);
  if (m && req.method === 'GET') {
    const ex = executions.get(m[1]);
    if (!ex) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      executionId: m[1],
      status: ex.status,
      progress: ex.progress,
      results: ex.results,
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(4000, () => console.log('API server running on http://localhost:4000'));
