const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const postsDir = path.join(__dirname, 'posts');
// 💡 완성된 HTML 파일들이 저장될 하위 폴더 지정 ('pages' 폴더)
const outputDir = path.join(__dirname, 'pages'); 

// 💡 본인의 구글 애드센스 코드를 상수로 선언합니다. (pub 번호 꼭 변경하세요!)
const ADSENSE_CODE = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5588756282976438"
     crossorigin="anonymous"></script>`;

// 1. 본문 HTML 템플릿 (pages 폴더 내부에서 한 단계 위인 루트의 CSS/JS를 바라보도록 ../ 추가)
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 나의 심플 블로그</title>
    ${ADSENSE_CODE} <link rel="stylesheet" href="../github-markdown.min.css">
    <link rel="stylesheet" href="../github.min.css">
    <script src="../highlight.js" defer></script>
    <script src="../python.min.js" defer></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        
        .blog-header-title { 
            display: block; font-size: 2rem; font-weight: bold; color: #24292e; text-decoration: none; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 20px;
        }
        .blog-header-title:hover { color: #0066cc; }

        /* 💡 홈으로 돌아가는 링크도 한 단계 상위인 ../index.html로 지정 */
        .back-link { display: inline-block; margin-bottom: 20px; color: #0066cc; text-decoration: none; font-weight: bold; }
        .back-link:hover { text-decoration: underline; }
        .post-content { padding: 30px; border: 1px solid #e1e4e8; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .post-content pre { background-color: #f6f8fa !important; padding: 16px; border-radius: 6px; overflow-x: auto; }
        .post-content code { font-family: Consolas, Monaco, monospace; font-size: 14px; }
        
        @media (max-width: 480px) {
            body { margin: 20px auto; padding: 0 12px; }
            .blog-header-title { font-size: 1.6rem; padding-bottom: 8px; margin-bottom: 15px; }
            .post-content { padding: 15px; }
            .post-content h1 { font-size: 1.4rem !important; line-height: 1.4; }
            .post-content h2 { font-size: 1.2rem !important; }
            .post-content pre { padding: 12px; }
            .post-content code { font-size: 12px; }
        }
    </style>
</head>
<body>
    <a href="../index.html" class="blog-header-title">📝 intRo-Lab. Blog </a>
    <a href="../index.html" class="back-link">⬅️ 글 목록으로 돌아가기</a>
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

// 2. 메인 목록(index.html) 템플릿 (루트에 위치하므로 CSS 및 경로 기본값 유지)
const indexTemplate = (linksHtml) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>나의 심플 블로그</title>
    ${ADSENSE_CODE} <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 12px; font-size: 2rem; }
        .post-list { list-style: none; padding: 0; }
        .post-item { margin: 22px 0; border-bottom: 1px dashed #eee; padding-bottom: 18px; }
        .post-link { color: #0066cc; text-decoration: underline; font-weight: bold; font-size: 1.25rem; }
        .post-link:hover { color: #004499; }
        
        @media (max-width: 480px) {
            body { margin: 20px auto; padding: 0 12px; }
            h1 { font-size: 1.6rem; padding-bottom: 8px; }
            .post-item { margin: 16px 0; padding-bottom: 12px; }
            .post-link { font-size: 1.1rem; line-height: 1.4; }
        }
    </style>
</head>
<body>
    <h1>📝 intRo-Lab. Blog </h1>
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
    // 💡 pages 폴더가 없으면 빌드 시점에 자동으로 생성합니다.
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
        
        const htmlContent = marked.parse(body);
        const finalHtml = htmlTemplate(title, htmlContent);
        
        // 💡 지정한 하위 폴더(pages/) 내부로 HTML 저장
        fs.writeFileSync(path.join(outputDir, `${fileNameWithoutExt}.html`), finalHtml, 'utf-8');

        // 💡 메인 목록에서 링크를 누를 때 pages/ 하위 경로로 타도록 주소 수정
        linksHtml += `<li class="post-item"><a href="pages/${fileNameWithoutExt}.html" class="post-link">${title}</a></li>\n`;
    });

    // index.html 자동 갱신 (index.html은 루트 자리에 그대로 생성)
    const finalIndex = indexTemplate(linksHtml || '<p>등록된 글이 없습니다.</p>');
    fs.writeFileSync(path.join(__dirname, 'index.html'), finalIndex, 'utf-8');
    console.log('🎉 하위 폴더(pages/) 격리 및 애드센스 빌드 완료!');
}

buildBlog();
