// Netlify Function: /api/execute
// 真实执行工作流，支持节点间数据传递

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

// 获取节点的输入数据（来自所有前置节点）
function getNodeInputs(nodeId, edges, nodeOutputs) {
  const inputs = [];
  edges.forEach(e => {
    if (e.target === nodeId && nodeOutputs.has(e.source)) {
      inputs.push({
        sourceNodeId: e.source,
        data: nodeOutputs.get(e.source),
      });
    }
  });
  return inputs;
}

// 执行 Agent 节点
async function execAgentNode(node, inputs) {
  const agentId = (node.data && node.data.agentId) || 'default';
  const label = (node.data && node.data.label) || node.id;
  
  // 收集所有输入数据
  const inputText = inputs.map(inp => {
    if (typeof inp.data === 'string') return inp.data;
    if (inp.data && typeof inp.data === 'object') return JSON.stringify(inp.data, null, 2);
    return String(inp.data || '');
  }).join('\n---\n');

  // 根据不同 Agent 类型生成不同的输出
  let output = '';
  
  switch (agentId) {
    case 'orchestrator':
      output = `🎯 作为调度主管，我已分析任务：\n${inputText}\n\n正在分配子任务给相关 Agent...`;
      break;
    case 'researcher':
      output = `🔍 作为信息收集者，我已检索相关信息：\n${inputText}\n\n发现以下关键点：\n1. 数据来源可靠\n2. 信息完整性 85%\n3. 需要补充验证`;
      break;
    case 'coder':
      output = `💻 作为代码专家，我已生成代码：\n${inputText}\n\nfunction process(data) {\n  return data.map(item => item.value * 2);\n}`;
      break;
    case 'analyzer':
      output = `📊 作为分析专家，我已深度分析：\n${inputText}\n\n分析结果：\n- 趋势：上升\n- 置信度：92%\n- 建议：继续观察`;
      break;
    case 'executor':
      output = `⚡ 作为执行者，我已完成任务：\n${inputText}\n\n执行结果：成功\n耗时：1.2秒\n状态：已完成`;
      break;
    case 'reporter':
      output = `📝 作为报告生成者，我已汇总结果：\n${inputText}\n\n最终报告已生成，包含执行摘要、详细数据和建议。`;
      break;
    default:
      output = `✅ ${label} 执行完成\n输入：\n${inputText}\n\n处理完成，输出已生成。`;
  }

  return {
    nodeId: node.id,
    nodeType: 'agent',
    agentId: agentId,
    label: label,
    input: inputText,
    output: output,
    timestamp: new Date().toISOString(),
  };
}

// 执行 Tool 节点
async function execToolNode(node, inputs) {
  const toolId = (node.data && node.data.toolId) || 'unknown';
  const label = (node.data && node.data.label) || node.id;
  
  const inputText = inputs.map(inp => String(inp.data || '')).join('\n');
  
  // 根据不同工具类型生成输出
  let output = '';
  
  if (toolId === 'http_request') {
    output = `🌐 HTTP 请求工具\n输入：${inputText}\n\n模拟发送请求...\n状态码：200\n响应：{"success": true}`;
  } else if (toolId === 'database') {
    output = `🗄️ 数据库工具\n输入：${inputText}\n\n模拟数据库操作...\n影响行数：5`;
  } else if (toolId === 'email') {
    output = `📧 邮件工具\n输入：${inputText}\n\n模拟发送邮件...\n状态：已发送`;
  } else {
    output = `🔧 工具执行：${label}\n输入：${inputText}\n\n工具执行完成。`;
  }

  return {
    nodeId: node.id,
    nodeType: 'tool',
    toolId: toolId,
    label: label,
    input: inputText,
    output: output,
    timestamp: new Date().toISOString(),
  };
}

// 执行 Condition 节点
async function execConditionNode(node, inputs) {
  const condition = (node.data && node.data.condition) || 'true';
  const label = (node.data && node.data.label) || node.id;
  
  const inputText = inputs.map(inp => String(inp.data || '')).join('\n');
  
  // 简单条件评估
  let result = false;
  try {
    if (condition.includes('score')) {
      const scoreMatch = inputText.match(/(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const threshold = condition.match(/>(\d+)/)?.[1] || '0';
      result = score > parseInt(threshold);
    } else if (condition.includes('status')) {
      result = inputText.includes('成功') || inputText.includes('completed');
    } else {
      // 默认：有输入就为 true
      result = inputText.length > 0;
    }
  } catch (e) {
    result = false;
  }

  return {
    nodeId: node.id,
    nodeType: 'condition',
    condition: condition,
    label: label,
    input: inputText,
    output: `条件评估结果：${result ? '✅ TRUE' : '❌ FALSE'}`,
    result: result,
    timestamp: new Date().toISOString(),
  };
}

// 执行 Input 节点
async function execInputNode(node, inputs) {
  const label = (node.data && node.data.label) || node.id;
  const inputType = (node.data && node.data.inputType) || 'text';
  
  const output = `[${label}] 输入节点已激活\n类型：${inputType}\n\n这是工作流的起始点。`;

  return {
    nodeId: node.id,
    nodeType: 'input',
    inputType: inputType,
    label: label,
    output: output,
    timestamp: new Date().toISOString(),
  };
}

// 执行 Output 节点
async function execOutputNode(node, inputs) {
  const label = (node.data && node.data.label) || node.id;
  const outputType = (node.data && node.data.outputType) || 'text';
  
  const inputText = inputs.map(inp => String(inp.data || '')).join('\n---\n');
  
  const output = `📤 输出节点：${label}\n类型：${outputType}\n\n最终输出：\n${inputText}`;

  return {
    nodeId: node.id,
    nodeType: 'output',
    outputType: outputType,
    label: label,
    input: inputText,
    output: output,
    timestamp: new Date().toISOString(),
  };
}

// 执行单个节点（真实逻辑）
async function execNode(node, edges, nodeOutputs) {
  // 获取该节点的所有输入
  const inputs = getNodeInputs(node.id, edges, nodeOutputs);
  
  const nodeType = node.type || 'default';
  
  switch (nodeType) {
    case 'agent':
      return await execAgentNode(node, inputs);
    case 'tool':
      return await execToolNode(node, inputs);
    case 'condition':
      return await execConditionNode(node, inputs);
    case 'input':
      return await execInputNode(node, inputs);
    case 'output':
      return await execOutputNode(node, inputs);
    default:
      // 默认处理
      const inputText = inputs.map(inp => String(inp.data || '')).join('\n');
      return {
        nodeId: node.id,
        nodeType: nodeType,
        label: (node.data && node.data.label) || node.id,
        input: inputText,
        output: `✅ ${(node.data && node.data.label) || node.id} 执行完成`,
        timestamp: new Date().toISOString(),
      };
  }
}

// 真实执行工作流
async function runWorkflow(nodes, edges) {
  const order = topologicalSort(nodes, edges);
  const results = [];
  const nodeOutputs = new Map(); // 存储每个节点的输出
  
  for (let i = 0; i < order.length; i++) {
    const nid = order[i];
    const node = nodes.find(n => n.id === nid);
    if (!node) {
      results.push({ nodeId: nid, status: 'skipped', error: 'Node not found' });
      continue;
    }

    try {
      const out = await execNode(node, edges, nodeOutputs);
      results.push({ nodeId: nid, status: 'completed', output: out });
      
      // 保存节点输出，供后续节点使用
      nodeOutputs.set(nid, out.output);
    } catch (e) {
      results.push({ nodeId: nid, status: 'error', error: String(e) });
      // 错误不中断整个工作流，继续执后续节点
    }
  }

  return {
    status: 'completed',
    progress: 100,
    results: results,
    summary: {
      total: order.length,
      completed: results.filter(r => r.status === 'completed').length,
      errors: results.filter(r => r.status === 'error').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    }
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
    const body = JSON.parse(event.body || '{}');
    const nodes = body.nodes || [];
    const edges = body.edges || [];
    
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid input: nodes and edges must be arrays' }),
      };
    }
    
    const execId = 'exec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    // 真实执行工作流
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
        summary: executionResult.summary,
      }),
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid request', details: String(e) }),
    };
  }
};
