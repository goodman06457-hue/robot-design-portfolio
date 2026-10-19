const video = document.querySelector('#project-video');
const status = document.querySelector('#video-status');
const chapterButtons = [...document.querySelectorAll('[data-time]')];
let pendingTime = null;
let seekableVideo = null;
function prepareChapterPlayback() {
  if (seekableVideo) return seekableVideo;
  seekableVideo = (async () => {
    // A complete local media object also supports seeking on hosts that omit
    // byte-range responses. Keep ordinary playback progressive until requested.
    const response = await fetch(video.querySelector('source').src);
    if (!response.ok) throw new Error('Video unavailable');
    const blob = await response.blob();
    await new Promise((resolve, reject) => {
      const ready = () => { cleanup(); resolve(); };
      const failed = () => { cleanup(); reject(new Error('Video unavailable')); };
      const cleanup = () => { video.removeEventListener('loadedmetadata', ready); video.removeEventListener('error', failed); };
      video.addEventListener('loadedmetadata', ready);
      video.addEventListener('error', failed);
      video.src = URL.createObjectURL(blob);
      video.load();
    });
  })().catch(error => { seekableVideo = null; throw error; });
  return seekableVideo;
}
function seekAndPlay(time) {
  video.currentTime = time;
  video.play().then(() => { status.textContent = ''; }).catch(() => {
    status.textContent = '章节已定位，请点击视频中的播放按钮。';
  });
}
chapterButtons.forEach(button => button.addEventListener('click', async () => {
  const time = Number(button.dataset.time);
  pendingTime = time;
  status.textContent = '正在加载视频并定位章节，请稍候…';
  video.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  try {
    await prepareChapterPlayback();
    if (pendingTime === time) seekAndPlay(time);
  } catch {
    status.textContent = '章节暂时无法加载，请点击视频播放按钮，或选择“单独打开视频”。';
  }
}));
video.addEventListener('timeupdate', () => {
  let current = 0;
  chapterButtons.forEach((button, index) => { if (video.currentTime >= Number(button.dataset.time)) current = index; });
  chapterButtons.forEach((button, index) => { button.classList.toggle('active', current === index); button.setAttribute('aria-pressed', String(current === index)); });
});
video.addEventListener('error', () => { status.textContent = '视频暂时无法加载，请尝试“单独打开视频”，或稍后刷新页面。'; });
const dialog = document.querySelector('#image-dialog');
const fullImage = document.querySelector('#full-image');
const caption = document.querySelector('#image-caption');
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  fullImage.src = button.dataset.image;
  fullImage.alt = button.dataset.caption;
  caption.textContent = button.dataset.caption;
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
document.querySelector('#year').textContent = new Date().getFullYear();
