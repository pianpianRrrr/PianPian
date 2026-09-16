import { $, escapeHTML as esc, storage, toast } from './core.js';
export function mountComments(root, articleId) {
  const key = 'blog-comments-' + articleId;
  let comments = [];
  try { const value = JSON.parse(storage.get(key, '[]')); if (Array.isArray(value)) comments = value.filter(c => c && typeof c.author === 'string' && typeof c.body === 'string'); } catch { /* Recover from malformed local data. */ }
  root.innerHTML = '<h2>林间留言</h2><p>留言仅保存在当前浏览器，不会发送给站长或其他访客。</p><form id="commentForm"><label>怎么称呼你<input id="commentAuthor" name="author" required maxlength="40" autocomplete="nickname"></label><label>留下一点想法<textarea id="commentBody" name="body" required maxlength="2000" rows="4" placeholder="写下你的想法…"></textarea></label><button class="button primary" type="submit">保存本地留言</button></form><div id="commentUndo" role="status" hidden>留言已删除。<button class="text-link" type="button">撤销删除</button></div><div id="commentList" aria-live="polite"></div>';
  let removed = null;
  function render() { $('#commentList',root).innerHTML = comments.map((c,index) => `<article class="comment-item"><header><strong>${esc(c.author)}</strong><time>${Number.isFinite(Number(c.time)) ? esc(new Date(Number(c.time)).toLocaleDateString('zh-CN')) : ''}</time><button data-delete="${index}" aria-label="删除 ${esc(c.author)} 的本地留言">删除</button></header><p>${esc(c.body)}</p></article>`).join(''); }
  function save(next) { if (!storage.set(key,JSON.stringify(next))) { toast('浏览器无法保存留言，请检查存储设置'); return false; } comments = next; render(); return true; }
  $('#commentForm',root).addEventListener('submit', event => { event.preventDefault(); const author = $('#commentAuthor',root).value.trim(); const body = $('#commentBody',root).value.trim(); if (!author || !body) { toast('请填写称呼和留言内容'); return; } if (save([{author,body,time:Date.now()},...comments])) { event.target.reset(); toast('留言已保存在此浏览器'); } });
  $('#commentList',root).addEventListener('click', event => { const button = event.target.closest('[data-delete]'); if (button) { const index = Number(button.dataset.delete); const item = comments[index]; if (save(comments.filter((_,i) => i !== index))) { removed = {item,index}; $('#commentUndo',root).hidden = false; } } });
  $('#commentUndo button',root).addEventListener('click', () => { if (!removed) return; const next = [...comments]; next.splice(removed.index,0,removed.item); if (save(next)) { removed = null; $('#commentUndo',root).hidden = true; toast('留言已恢复'); } });
  render();
}
