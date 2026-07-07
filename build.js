const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const postsDir = path.join(__dirname, 'posts');
const outputDir = path.join(__dirname, 'pages'); 

const ADSENSE_CODE = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5588756282976438" crossorigin="anonymous"></script>`;

// 1. 본문 HTML 템플릿
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${title} - intRo-Lab. Blog</title>
    ${ADSENSE_CODE}
    <link rel="stylesheet" href="../github-markdown.min.css">
    <link rel="stylesheet" href="../github.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="../highlight.js" defer></script>
    <script src="../python.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" defer></script>
    <style>
        /* 가로 스크롤 방지 및 기본 레이아웃 */
        html, body { overflow-x: hidden; width: 100%; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Arial", "Malgun Gothic", "맑은 고딕", sans-serif; 
            max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #24292e; background-color: #ffffff;
        }
        * { box-sizing: border-box; }
        .blog-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 20px; }
        .blog-header-title { font-size: 2rem; font-weight: bold; color: #24292e; text-decoration: none; }
        .home-btn { font-size: 0.95rem; color: #57606a; text-decoration: none; padding: 6px 12px; border: 1px solid #d0d7de; border-radius: 6px; background-color: #f6f8fa; }
        .post-content { padding: 30px; border: 1px solid #e1e4e8; border-radius: 8px; }
        
        /* 반응형 이미지 및 표 */
        .markdown-body img { max-width: 100% !important; height: auto; display: block; margin: 20px auto; }
        .markdown-body table { display: block; width: 100%; overflow-x: auto; border-collapse: collapse; }
        .markdown-body table th, .markdown-body table td { padding: 10px; border: 1px solid #ddd; }
        
        @media (max-width: 480px) {
            body { margin: 10px auto; padding: 0 10px; }
            .blog-header-title { font-size: 1.2rem !important; }
            .post-content { padding: 15px; width: 100% !important; }
            .post-content table { font-size: 12px; }
        }
    </style>
</head>
<body>
    <header class="blog-header">
        <a href="../index.html" class="blog-header-title">📝 intRo-Lab. Blog</a>
        <a href="https://www.intro-lab.com" target="_blank" class="home-btn">홈</a>
    </header>
    <div class="post-content markdown-body">${content}</div>
</body>
</html>`;

const indexTemplate = (linksHtml) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>intRo-Lab. Blog</title>
    ${ADSENSE_CODE}
    <style>
        body { font-family: sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        @media (max-width: 480px) { body { padding: 0 15px; } }
    </style>
</head>
<body>
    <h1>📝 intRo-Lab. Blog</h1>
    <ul>${linksHtml}</ul>
</body>
</html>`;

function parsePost(mdContent, defaultTitle) {
    const match = mdContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    let title = defaultTitle;
    let body = mdContent;
    if (match) {
        body = mdContent.replace(match[0], '');
        const titleMatch = match[1].match(/^title:\s*["']?(.*?)["']?$/m);
        if (titleMatch) title = titleMatch[1];
    }
    return { title, body };
}

function buildBlog() {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const files = fs.readdirSync(postsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md')).sort().reverse();
    let linksHtml = '';

    markdownFiles.forEach(file => {
        const mdContent = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        const fileNameWithoutExt = path.parse(file).name;
        const { title, body } = parsePost(mdContent, fileNameWithoutExt);
        const htmlContent = marked.parse(body);
        fs.writeFileSync(path.join(outputDir, `${fileNameWithoutExt}.html`), htmlTemplate(title, htmlContent));
        linksHtml += `<li><a href="pages/${fileNameWithoutExt}.html">${title}</a></li>`;
    });

    fs.writeFileSync(path.join(__dirname, 'index.html'), indexTemplate(linksHtml));
    console.log('✅ 빌드 완료!');
}

buildBlog();
