const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const postsDir = path.join(__dirname, 'posts');
const outputDir = __dirname;

// 1. 본문 HTML 템플릿
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 나의 심플 블로그</title>
    <link rel="stylesheet" href="github-markdown.min.css">
    <link rel="stylesheet" href="github.min.css">
    <script src="highlight.js" defer></script>
    <script src="python.min.js" defer></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #0066cc; text-decoration: none; font-weight: bold; }
        .post-content { padding: 30px; border: 1px solid #e1e4e8; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .post-content pre { background-color: #f6f8fa !important; padding: 16px; border-radius: 6px; overflow-x: auto; }
        .post-content code { font-family: Consolas, Monaco, monospace; font-size: 14px; }
    </style>
</head>
<body>
    <a href="index.html" class="back-link">⬅️ 글 목록으로 돌아가기</a>
    <div class="post-content markdown-body">${content}</div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof hljs !== 'undefined') {
                document.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el); });
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
    <title>나의 심플 블로그</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 12px; font-size: 2rem; }
        .post-list { list-style: none; padding: 0; }
        .post-item { margin: 20px 0; border-bottom: 1px dashed #eee; padding-bottom: 15px; }
        .post-link { color: #0066cc; text-decoration: underline; font-weight: bold; font-size: 1.1rem; }
    </style>
</head>
<body>
    <h1>📝 나의 블로그 포스트</h1>
    <ul class="post-list">${linksHtml}</ul>
</body>
</html>`;

function buildBlog() {
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);
    const files = fs.readdirSync(postsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md')).sort().reverse(); // 최신글 상단 배치

    let linksHtml = '';

    markdownFiles.forEach(file => {
        const filePath = path.join(postsDir, file);
        const mdContent = fs.readFileSync(filePath, 'utf-8');
        const fileNameWithoutExt = path.parse(file).name;
        
        // 본문 변환 및 저장
        const htmlContent = marked.parse(mdContent);
        const finalHtml = htmlTemplate(fileNameWithoutExt, htmlContent);
        fs.writeFileSync(path.join(outputDir, `${fileNameWithoutExt}.html`), finalHtml, 'utf-8');

        // 메인 목록에 넣을 링크 태그 조립
        linksHtml += `<li class="post-item"><a href="${fileNameWithoutExt}.html" class="post-link">${fileNameWithoutExt}</a></li>\n`;
    });

    // index.html 자동 갱신
    const finalIndex = indexTemplate(linksHtml || '<p>등록된 글이 없습니다.</p>');
    fs.writeFileSync(path.join(outputDir, 'index.html'), finalIndex, 'utf-8');
    console.log('🎉 깃허브 빌드 완료!');
}

buildBlog();
