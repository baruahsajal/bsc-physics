document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contentFile = urlParams.get('file');
    const contentType = urlParams.get('type') || 'Note';
    const contentTitle = urlParams.get('title') || 'Educational Content';
    const requiredPortal = urlParams.get('portal');

    if (requiredPortal) {
        AuthSystem.verifyAccess(requiredPortal);
    }

    const titleElement = document.getElementById('content-title');
    const typeElement = document.getElementById('content-type');
    const frameElement = document.getElementById('content-frame');
    const downloadBtn = document.getElementById('download-content-btn');

    if (titleElement) titleElement.textContent = decodeURIComponent(contentTitle);
    if (typeElement) typeElement.textContent = decodeURIComponent(contentType);
    
    if (frameElement && contentFile) {
        frameElement.src = decodeURIComponent(contentFile);
    } else if (frameElement) {
        frameElement.srcdoc = `
            <div style="display:flex; justify-content:center; align-items:center; height:100%; font-family:sans-serif; color:#666; background:#f8fafc;">
                <h2>Content not found or invalid parameters.</h2>
            </div>
        `;
    }

    if (downloadBtn && contentFile) {
        downloadBtn.href = decodeURIComponent(contentFile);
        downloadBtn.download = decodeURIComponent(contentTitle) + '.html';
    }

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn && frameElement) {
        fullscreenBtn.addEventListener('click', () => {
            if (frameElement.requestFullscreen) {
                frameElement.requestFullscreen();
            } else if (frameElement.webkitRequestFullscreen) {
                frameElement.webkitRequestFullscreen();
            } else if (frameElement.msRequestFullscreen) {
                frameElement.msRequestFullscreen();
            }
        });
    }
});
