const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const postsDir = path.join(__dirname, 'posts');
const outputDir = path.join(__dirname, 'pages'); 

const ADSENSE_CODE = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5588756282976438"
     crossorigin="anonymous"></script>`;

// 1. 본문 HTML 템플릿 (KaTeX 간섭으로 인한 제목 폰트 깨짐 해결 버전)
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
        /* 💡 기본 전체 텍스트에 고딕체(산세리프) 스타일 지정 */
        body, html, p, span, a, div { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Arial", "Malgun Gothic", "맑은 고딕", sans-serif; 
            max-width: 900px; 
            margin: 40px auto; 
            padding: 0 20px; 
            line-height: 1.7; 
            color: #24292e;
        }
        
        /* 💡 본문 내/외부의 모든 제목(H1~H6)이 명조체로 깨지는 문제를 방지합니다. */
        h1, h2, h3, h4, h5, h6,
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Arial", "Malgun Gothic", "맑은 고딕", sans-serif !important;
            font-weight: bold;
        }

        .blog-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 12px; margin
