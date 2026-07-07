const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const postsDir = path.join(__dirname, 'posts');
const outputDir = path.join(__dirname, 'pages'); 

const ADSENSE_CODE = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5588756282976438"
     crossorigin="anonymous"></script>`;

// 1. 본문 HTML 템플릿 (KaTeX 수식 엔진 추가)
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
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        .blog-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 20px; }
        .blog-header-title { font-size: 2rem; font-weight: bold; color: #24292e; text-decoration: none; }
        .blog-header-title:hover { color: #0066cc; }
        .home-btn { font-size: 0.95rem; font-weight: normal; color: #57606a; text-decoration: none; padding: 6px 12px; border: 1px solid #d0d7de; border-radius: 6px; background-color: #f6f8fa; transition: all 0.2s; }
        .home-btn:hover { background-color: #f3f4f6; color: #24292e; border-color: #8c959f; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #0066cc; text-decoration: none; font-weight: bold; }
        .back-link:hover { text-decoration: underline; }
        .post-content { padding: 30px; border: 1px solid #e1e4e8; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .post-content pre { background-color: #f6f8fa !important; padding: 16px; border-radius: 6px; overflow-x: auto; }
        .post-content code { font-family: Consolas, Monaco, monospace; font-size: 14px; }
        
        /* 🧮 수식 정렬 및 모바일 여백 보정 */
        .katex-display { margin: 1.2em 0; overflow-x: auto; overflow-y: hidden; }

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
            // 1. 코드 하이라이팅 적용
            if (typeof hljs !== 'undefined') {
                document.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el); });
            }
            
            // 2. 🧮 KaTeX 자동 수식 렌더링 적용
            if (typeof renderMathInElement !== 'undefined') {
                renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},   // 블록 수식
                        {left: '$', right: '$', display: false},     // 인라인 수식
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
            body { margin: 20px auto; padding: 0 12px; }
            .blog-header { padding-bottom: 8px; }
            .blog-header h1 { font-size: 1.5rem; }
            .home-btn { font-size: 0.85rem; padding: 4px 8px; }
            .post-item { margin: 16px 0; padding-bottom: 12px; }
            .post-link { font-size: 1.1rem; line-height: 1.4; }
        }
    </style>
</head>
<body>
    <header class="blog-header">
        <h1>📝 intRo-Lab. Blog </h1>
        <a href="https://www.intro-lab.com" target="_blank" class="home-btn">🏠 홈으로 가기</a>
    </header>
    <ul class="post-list">${linksHtml}</ul>
</body>
</html>`;

function parsePost(mdContent, defaultTitle) {
    const match = mdContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    let title = defaultTitle;
    let body = mdContent;

    if (match) {
        const metadata = match[1];
        body = mdContent.replace(match[0], '');
        const titleMatch = metadata.match(/^title:\s*["']?(.*?)["']?$/m);
        if (titleMatch) title = titleMatch[1];
    }
    return { title, body };
}

function buildBlog() {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);
    
    const files = fs.readdirSync(postsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md')).sort().reverse();

    let linksHtml = '';

    markdownFiles.forEach(file => {
        const filePath = path.join(postsDir, file);
        const mdContent = fs.readFileSync(filePath, 'utf-8');
        const fileNameWithoutExt = path.parse(file).name;
        
        const { title, body } = parsePost(mdContent, fileNameWithoutExt);
        
        // 💡 marked가 수식 내부 문법을 멋대로 변환하는 것을 최소화하기 위해 기본 파싱 진행
        const htmlContent = marked.parse(body);
        const finalHtml = htmlTemplate(title, htmlContent);
        
        fs.writeFileSync(path.join(outputDir, `${fileNameWithoutExt}.html`), finalHtml, 'utf-8');
        linksHtml += `<li class="post-item"><a href="pages/${fileNameWithoutExt}.html" class="post-link">${title}</a></li>\n`;
    });

    const finalIndex = indexTemplate(linksHtml || '<p>등록된 글이 없습니다.</p>');
    fs.writeFileSync(path.join(__dirname, 'index.html'), finalIndex, 'utf-8');
    console.log('🎉 하위 폴더(pages/) 격리, 애드센스 및 수식(KaTeX) 빌드 완료!');
}

buildBlog();
