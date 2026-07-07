const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const postsDir = path.join(__dirname, 'posts');
const outputDir = path.join(__dirname, 'pages'); 

const ADSENSE_CODE = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5588756282976438"
     crossorigin="anonymous"></script>`;

// 1. 본문 HTML 템플릿
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - intRo-Lab. Blog </title>
    ${ADSENSE_CODE} 
    <link rel="stylesheet" href="../github-markdown.min.css">
    <link rel="stylesheet" href="../github.min.css">
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    
    <script src="../highlight.js" defer></script>
    <script src="../python.min.js" defer></script>
    
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" defer></script>

    <style>
        /* 💡 1. 블로그 기본 폰트 정의 (KaTeX 서체가 침범하지 못하도록 가장 구체적인 경로로 방어) */
        body, 
        .blog-header-title, 
        .home-btn, 
        .back-link,
        .markdown-body,
        .markdown-body h1, 
        .markdown-body h2, 
        .markdown-body h3, 
        .markdown-body h4,
        .markdown-body p,
        .markdown-body li { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji" !important; 
        }

        body { max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        .blog-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 20px; }
        .blog-header-title { font-size: 2rem; font-weight: bold; color: #24292e; text-decoration: none; }
        .blog-header-title:hover { color: #0066cc; }
        .home-btn { font-size: 0.95rem; font-weight: normal; color: #57606a; text-decoration: none; padding: 6px 12px; border: 1px solid #d0d7de; border-radius: 6px; background-color: #f6f8fa; transition: all 0.2s; }
        .home-btn:hover { background-color: #f3f4f6; color: #24292e; border-color: #8c959f; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #0066cc; text-decoration: none; font-weight: bold; }
        .back-link:hover { text-decoration: underline; }
        .post-content { padding: 30px; border: 1px solid #e1e4e8; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .post-content pre { background-color: #f6f8fa !important; padding: 16px; border-radius: 6px; overflow-x: auto; }
        .post-content code { font-family: Consolas, Monaco, monospace !important; font-size: 14px; }
        
        /* 🧮 수식 정렬 및 모바일 여백 보정 */
        .katex-display { margin: 1.2em 0; overflow-x: auto; overflow-y: hidden; }
        
        /* 💡 2. 오직 수식 기호 내부(.katex)와 그 하위 요소들만 수식 전용 서체를 쓰도록 한 번 더 격리 */
        .katex, .katex * { 
            font-family: KaTeX_Main, Times New Roman, serif !important; 
        }

        @media (max-width: 480px) {
            body { margin: 20px auto; padding: 0 12px; }
            .blog-header { padding-bottom: 8px; margin-bottom: 15px; }
            .blog-header-title { font-size: 1.5rem; }
            .home-btn { font-size: 0.85rem; padding: 4px 8px; }
            .post-content { padding: 15px; }
            .post-content h1 { font-size: 1.4rem !important; line-height: 1.4; }
            .post-content h2 { font-size: 1.2rem !important; }
            .post-content pre { padding: 12px; }
            .post-content code { font-size: 12px; }
        }
    </style>
</head>
<body>
    <header class="blog-header">
        <a href="../index.html" class="blog-header-title">📝 intRo-Lab. Blog </a>
        <a href="https://www.intro-lab.com" target="_blank" class="home-btn">🏠 홈으로 가기</a>
    </header>
    
    <a href="../index.html" class="back-link">⬅️ 글 목록으로 돌아가기</a>
    <div class="post-content markdown-body">${content}</div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof hljs !== 'undefined') {
                document.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el); });
            }
            
            if (typeof renderMathInElement !== 'undefined') {
                renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},   
                        {left: '$', right: '$', display: false},     
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            }
        });
    </script>
</body>
</html>`;

// 2. 메인 목록(index.html) 템플릿
const indexTemplate = (linksHtml) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>intRo-Lab. Blog</title>
    ${ADSENSE_CODE} 
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        .blog-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 20px; }
        .blog-header h1 { margin: 0; font-size: 2rem; }
        .home-btn { font-size: 0.95rem; font-weight: normal; color: #57606a; text-decoration: none; padding: 6px 12px; border: 1px solid #d0d7de; border-radius: 6px; background-color: #f6f8fa; transition: all 0.2s; }
        .home-btn:hover { background-color: #f3f4f6; color: #24292e; border-color: #8c959f; }
        .post-list { list-style: none; padding: 0; }
        .post-item { margin: 22px 0; border-bottom: 1px dashed #eee; padding-bottom: 18px; }
        .post-link { color: #0066cc; text-decoration: underline; font-weight: bold; font-size: 1.25rem; }
        .post-link:hover { color: #004499; }
        
        @media (max-width: 480px) {
            body { margin: 20px auto; padding: 0 12px;
