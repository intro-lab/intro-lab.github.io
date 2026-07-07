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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        body, html { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Arial", "Malgun Gothic", "맑은 고딕", sans-serif; 
            max-width: 900px; 
            margin: 40px auto; 
            padding: 0 20px; 
            line-height: 1.7; 
            color: #24292e;
            background-color: #ffffff;
        }
        p, span, a, div { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Arial", "Malgun Gothic", "맑은 고딕", sans-serif; }
        h1, h2, h3, h4, h5, h6, .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Arial", "Malgun Gothic", "맑은 고딕", sans-serif !important;
            font-weight: bold;
        }
        .blog-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 20px; }
        .blog-header-title { font-size: 2rem; font-weight: bold; color: #24292e; text-decoration: none; }
        .blog-header-title:hover { color: #0066cc; }
        .home-btn { font-size: 0.95rem; font-weight: normal; color: #57606a; text-decoration: none; padding: 6px 12px; border: 1px solid #d0d7de; border-radius: 6px; background-color: #f6f8fa; transition: all 0.2s; }
        .home-btn:hover { background-color: #f3f4f6; color: #24292e; border-color: #8c959f; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #0066cc; text-decoration: none; font-weight: bold; }
        .back-link:hover { text-decoration: underline; }
        .post-content { padding: 30px; border: 1px solid #e1e4e8; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .post-content pre { background-color: #f6f8fa !important; padding: 16px; border-radius: 6px; overflow-x: auto; }
        
        .markdown-body img { max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }

        .markdown-body table { display: block; width: 100%; max-width: 100%; overflow-x: auto; white-space: nowrap; border-collapse: collapse; margin-bottom: 1.5em; }
        .markdown-body table th, .markdown-body table td { padding: 10px 14px; border: 1px solid #dfe2e5; }
        .markdown-body table th { background-color: #f6f8fa; font-weight: 600; }
        .markdown-body table tr:nth-child(even) { background-color: #f9f9f9; }

        .post-content pre code, .post-content pre code span { font-family: Consolas, Monaco, monospace !important; font-size: 14px; margin: 0 !important; padding: 0 !important; line-height: 1.5; }
        .katex-display { margin: 1.2em 0; overflow-x: auto; overflow-y: hidden; }
        .katex, .katex * { font-family: KaTeX_Main, Times New Roman, serif !important; margin: 0 !important; padding: 0 !important; }
        
        @media (max-width: 480px) {
            body, html { margin: 20px auto; padding: 0 12px; }
            .blog-header { padding-bottom: 8px; margin-bottom: 15px; }
            .blog-header-title { font-size: 1.2rem !important; }
            .home-btn { font-size: 0.8rem; padding: 3px 6px; }
            .post-content { padding: 15px; }
            .post-content h1 { font-size: 1.3rem !important; line-height: 1.3; }
            .post-content h2 { font-size: 1.1rem !important; }
            .post-content pre { padding: 12px; }
            .post-content table { font-size: 12px; }
            .post-content code, .post-content pre code span { font-size: 12px; }
        }
    </style>
</head>
<body>
    <header class="blog-header">
        <a href="../index.html" class="blog-header-title">📝 intRo-Lab. Blog</a>
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
                        {left: '\\\\(', right: '\\\\)', display: false},
                        {left: '\\\\[', right: '\\\\]', display: true}
                    ],
                    throwOnError: false
                });
            }
        });
    </script>
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
        <h1>📝 intRo-Lab. Blog</h1>
        <a href="https://www.intro-lab.com" target="_blank" class="home-btn">🏠 홈으로 가기</a>
    </header>
    <ul class="post-list">${linksHtml}</ul>
</body>
</html>`;

function parsePost(mdContent, defaultTitle) {
    const match = mdContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
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
        const htmlContent = marked.parse(body, { async: false });
        const finalHtml = htmlTemplate(title, htmlContent);
        
        fs.writeFileSync(path.join(outputDir, `${fileNameWithoutExt}.html`), finalHtml, 'utf-8');
        linksHtml += `<li class="post-item"><a href="pages/${fileNameWithoutExt}.html" class="post-link">${title}</a></li>\n`;
    });

    const finalIndex = indexTemplate(linksHtml || '<p>등록된 글이 없습니다.</p>');
    fs.writeFileSync(path.join(__dirname, 'index.html'), finalIndex, 'utf-8');
    console.log('🎉 하위 폴더(pages/) 격리, 애드센스 및 수식(KaTeX) 빌드 완료!');
}

buildBlog();
