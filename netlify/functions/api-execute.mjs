// Netlify Function: /api/execute
// 同步执行工作流，直接返回结果

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
async function execNode(node) {
  const delay = Math.floor(Math.random() * 1000) + 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  return {
    nodeId: node.id,
    nodeType: node.type,
    label: (node.data && node.data.label) || node.id,
    result: `✅ ${(node.data && node.data.label) || node.id} 执行完成`,
    timestamp: new Date().toISOString(),
  };
}

// 同步执行工作流
async function runWorkflow(nodes, edges) {
  const order = topologicalSort(nodes, edges);
  const results = [];
  let progress = 0;
  const total = order.length;

  for (let i = 0; i < order.length; i++) {
    const nid = order[i];
    const node = nodes.find(n => n.id === nid);
    if (!node) {
      results.push({ nodeId: nid, status: 'skipped', error: 'Node not found' });
      continue;
    }

    try {
      const out = await execNode(node);
      results.push({ nodeId: nid, status: 'completed', output: out });
    } catch (e) {
      results.push({ nodeId: nid, status: 'error', error: String(e) });
    }

    progress = Math.round(((i + 1) / total) * 100);
  }

  return {
    status: 'completed',
    progress: 100,
    results: results,
  };
}

export const handler = async (event, context) => {
  // 处理 CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { nodes, edges } = JSON.parse(event.body);
    const execId = 'exec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    // 同步执行工作流
    const executionResult = await runWorkflow(nodes, edges);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        executionId: execId,
        status: executionResult.status,
        progress: executionResult.progress,
        results: executionResult.results,
      }),
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid JSON', details: String(e) }),
    };
  }
};
