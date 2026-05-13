// 最小化测试函数
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({
      message: 'API is working!',
      method: event.httpMethod,
      timestamp: new Date().toISOString(),
    }),
  };
};
