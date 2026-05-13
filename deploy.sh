#!/bin/bash
# AIFlow MVP 一键部署脚本

echo "🚀 AIFlow MVP 部署助手"
echo "================================"
echo ""

# 检查构建产物
if [ ! -d "dist" ]; then
    echo "❌ 错误：dist/ 目录不存在，请先运行 npm run build"
    exit 1
fi

echo "✅ 构建产物检查通过"
echo ""
echo "请选择部署方式："
echo "1) Netlify (拖拽上传 - 最简单)"
echo "2) Vercel (需要登录)"
echo "3) 本地预览构建结果"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Netlify 拖拽上传部署："
        echo "1. 访问 https://app.netlify.com"
        echo "2. 将以下文件夹拖拽到页面："
        echo "   $(pwd)/dist"
        echo "3. 等待上传完成（约30秒）"
        echo "4. 获得演示URL：https://xxx.netlify.app"
        echo ""
        echo "📂 构建产物位置："
        echo "   $(pwd)/dist"
        explorer "$(pwd)/dist"
        ;;
    2)
        echo ""
        echo "📦 Vercel 部署："
        echo "1. 先登录 Vercel："
        echo "   npx vercel login"
        echo ""
        echo "2. 部署到生产环境："
        echo "   npx vercel --prod"
        echo ""
        read -p "是否现在执行登录？ (y/n): " do_login
        if [ "$do_login" = "y" ]; then
            npx vercel login
            npx vercel --prod
        fi
        ;;
    3)
        echo ""
        echo "📱 启动本地预览服务器..."
        npm run preview -- --host 0.0.0.0 --port 4173 &
        sleep 3
        echo "✅ 预览服务器已启动"
        echo "🌐 访问地址："
        echo "   <a href="http://localhost:4173">http://localhost:4173</a>"
        echo "   <a href="http://$(hostname -I | awk '{print $1}'):4173">http://$(hostname -I | awk '{print $1}'):4173</a>"
        echo ""
        echo "按 Ctrl+C 停止服务器"
        wait
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
