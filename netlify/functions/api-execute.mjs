// Netlify Function: /api/execute
// 真实执行工作流，支持 DeepSeek LLM 调用和节点间数据传递

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 默认 Agent 角色提示词
const DEFAULT_SYSTEM_PROMPTS = {
  orchestrator: '你是一个任务调度主管。你的职责是分析用户的需求，将其分解为子任务，并为每个子任务指定合适的处理方式。输出要清晰、有条理。',
  researcher: '你是一个专业的研究助手。你的职责是收集、整理和分析信息，提供准确、全面的研究结果。输出要包含关键发现和数据支撑。',
  coder: '你是一个编程专家。你的职责是根据需求编写高质量代码，代码要有注释、结构清晰。使用 Markdown 代码块格式输出代码。',
  analyzer: '你是一个数据分析专家。你的职责是对提供的数据和信息进行深度分析，给出趋势判断、关键指标和行动建议。',
  executor: '你是一个任务执行专家。你的职责是高效完成分配给你的任务，输出执行结果和状态报告。',
  reporter: '你是一个报告撰写专家。你的职责是将分析结果整理为结构清晰的报告，包含摘要、详细内容和结论。',
  default: '你是一个 AI 助手。请根据用户的输入提供高质量的回答。',
};

// 调用 DeepSeek API
async function callDeepSeek(apiKey, model, messages, temperature) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages,
      temperature: temperature !== undefined ? temperature : 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`DeepSeek API 错误 (${response.status}): ${errorBody || response.statusText}`);
  }

  return await response.json();
}

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

// 收集输入文本
function collectInputText(inputs) {
  return inputs.map(inp => {
    if (typeof inp.data === 'string') return inp.data;
    if (inp.data && typeof inp.data === 'object') return JSON.stringify(inp.data, null, 2);
    return String(inp.data || '');
  }).join('\n---\n');
}

// 执行 Agent 节点（真实 LLM 调用）
async function execAgentNode(node, inputs, llmConfig) {
  const agentId = (node.data && node.data.agentId) || 'default';
  const label = (node.data && node.data.label) || node.id;
  const userPromptTemplate = (node.data && node.data.prompt) || '';
  const systemPrompt = (node.data && node.data.systemPrompt) || '';

  // 收集上游输入
  const inputText = collectInputText(inputs);

  // 如果没有 API Key，回退到 mock 模式
  if (!llmConfig || !llmConfig.apiKey) {
    let output = `[Mock] ${label} 执行完成\n输入：\n${inputText || '(无输入)'}\n\n⚠️ 未配置 API Key，使用模拟输出。请在设置中配置 DeepSeek API Key。`;
    return {
      nodeId: node.id,
      nodeType: 'agent',
      agentId: agentId,
      label: label,
      input: inputText,
      output: output,
      mock: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 构建 messages
  const sysPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPTS[agentId] || DEFAULT_SYSTEM_PROMPTS.default;
  const userPrompt = userPromptTemplate
    ? userPromptTemplate.replace(/\{input\}/g, inputText)
    : `请处理以下内容：\n\n${inputText || '(无输入)'}`;

  const messages = [
    { role: 'system', content: sysPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const apiResponse = await callDeepSeek(
      llmConfig.apiKey,
      llmConfig.model,
      messages,
      llmConfig.temperature
    );

    const content = apiResponse.choices?.[0]?.message?.content || '(无响应)';
    const tokenUsage = apiResponse.usage || null;

    return {
      nodeId: node.id,
      nodeType: 'agent',
      agentId: agentId,
      label: label,
      input: inputText,
      output: content,
      tokenUsage: tokenUsage ? {
        prompt_tokens: tokenUsage.prompt_tokens,
        completion_tokens: tokenUsage.completion_tokens,
        total_tokens: tokenUsage.total_tokens,
      } : null,
      model: llmConfig.model,
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return {
      nodeId: node.id,
      nodeType: 'agent',
      agentId: agentId,
      label: label,
      input: inputText,
      output: `❌ LLM 调用失败: ${e.message}`,
      error: e.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// 执行 Tool 节点
async function execToolNode(node, inputs) {
  const toolId = (node.data && node.data.toolId) || 'unknown';
  const label = (node.data && node.data.label) || node.id;
  const inputText = collectInputText(inputs);

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
  const inputText = collectInputText(inputs);

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

// 执行 Input 节点（使用用户填写的值）
async function execInputNode(node) {
  const label = (node.data && node.data.label) || node.id;
  const inputType = (node.data && node.data.inputType) || 'text';
  const inputValue = (node.data && node.data.inputValue) || '';

  const output = inputValue || `[${label}] 输入节点已激活（未提供输入内容）`;

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

  const output = inputText || `📤 输出节点：${label}（无内容）`;

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

// 执行单个节点
async function execNode(node, edges, nodeOutputs, llmConfig) {
  const inputs = getNodeInputs(node.id, edges, nodeOutputs);
  const nodeType = node.type || 'default';

  switch (nodeType) {
    case 'agent':
      return await execAgentNode(node, inputs, llmConfig);
    case 'tool':
      return await execToolNode(node, inputs);
    case 'condition':
      return await execConditionNode(node, inputs);
    case 'input':
      return await execInputNode(node);
    case 'output':
      return await execOutputNode(node, inputs);
    default:
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

// 执行工作流
async function runWorkflow(nodes, edges, llmConfig) {
  const order = topologicalSort(nodes, edges);
  const results = [];
  const nodeOutputs = new Map();
  let totalTokens = 0;
  let llmUsed = false;

  for (let i = 0; i < order.length; i++) {
    const nid = order[i];
    const node = nodes.find(n => n.id === nid);
    if (!node) {
      results.push({ nodeId: nid, status: 'skipped', error: 'Node not found' });
      continue;
    }

    try {
      const out = await execNode(node, edges, nodeOutputs, llmConfig);

      // 统计 token 使用
      if (out.tokenUsage) {
        totalTokens += out.tokenUsage.total_tokens || 0;
        llmUsed = true;
      }
      if (out.mock) {
        // mock 模式不标记 llmUsed
      }

      results.push({ nodeId: nid, status: out.error ? 'error' : 'completed', output: out });
      nodeOutputs.set(nid, out.output);
    } catch (e) {
      results.push({ nodeId: nid, status: 'error', error: String(e) });
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
    },
    llmUsed: llmUsed,
    totalTokens: totalTokens,
    model: llmConfig?.model || null,
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
    const llmConfig = body.llmConfig || null;

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
    const executionResult = await runWorkflow(nodes, edges, llmConfig);

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
        llmUsed: executionResult.llmUsed,
        totalTokens: executionResult.totalTokens,
        model: executionResult.model,
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
