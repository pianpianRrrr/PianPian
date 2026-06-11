/* ============================================================
   "片片公子" 个人博客 — 共享工具函数
   ============================================================ */

var BlogUtils = {};

BlogUtils.$ = function(sel, ctx) {
  return (ctx || document).querySelector(sel);
};

BlogUtils.$$ = function(sel, ctx) {
  return [].slice.call((ctx || document).querySelectorAll(sel));
};

BlogUtils.formatDate = function(ts) {
  var d = new Date(ts);
  var pad = function(n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};

BlogUtils.escapeHtml = function(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

BlogUtils.calcReadTime = function(htmlContent) {
  var div = document.createElement('div');
  div.innerHTML = htmlContent;
  var text = div.textContent || '';
  var charCount = text.replace(/\s/g, '').length;
  // 中文 ~400 字/分钟
  var minutes = Math.max(1, Math.round(charCount / 400));
  return '约 ' + minutes + ' 分钟';
};
