(() => {
  const navButtons = Array.from(document.querySelectorAll(".nav__btn"));
  const pages = Array.from(document.querySelectorAll(".page"));
  const main = document.getElementById("main");

  function setActivePage(pageKey, pushHash = true) {
    navButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.page === pageKey));
    pages.forEach((page) => {
      const isActive = page.dataset.page === pageKey;
      page.classList.toggle("is-active", isActive);
      if (isActive) {
        // 触发淡入动画（重置 class）
        page.classList.remove("fade-in");
        // eslint-disable-next-line no-unused-expressions
        page.offsetHeight;
        page.classList.add("fade-in");
      }
    });
    if (pushHash) {
      location.hash = `#${pageKey}`;
    }
    // 让键盘用户切换后回到主内容
    if (main) main.focus({ preventScroll: false });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => setActivePage(btn.dataset.page));
  });

  // 初始页面：根据 hash
  const initial = (location.hash || "").replace("#", "").trim();
  if (initial && pages.some((p) => p.dataset.page === initial)) {
    setActivePage(initial, false);
  } else {
    setActivePage("trace", false);
  }

  // 溯源查询
  const data = (window.TRACE_DATA || []).slice();
  const traceForm = document.getElementById("traceForm");
  const traceInput = document.getElementById("traceInput");
  const traceResult = document.getElementById("traceResult");
  const fillDemo = document.getElementById("fillDemo");

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function findByCode(codeRaw) {
    const code = String(codeRaw || "").trim().toUpperCase();
    if (!code) return null;
    return data.find((x) => String(x.code).toUpperCase() === code) || null;
  }

  function renderNotFound(code) {
    traceResult.innerHTML = `
      <div class="result__error">
        未找到 <strong>${escapeHtml(code)}</strong> 的溯源记录（演示版）。
        <div class="hint" style="margin-top:8px">可用示例：<code>JY-2026-0001</code>、<code>JY-2026-0002</code>、<code>JY-2026-0003</code></div>
      </div>
    `;
  }

  function renderResult(item) {
    const stepsHtml = (item.steps || [])
      .map(
        (s) => `
        <div class="step">
          <div class="step__dot" aria-hidden="true"></div>
          <div>
            <div class="step__title">${escapeHtml(s.title)}</div>
            <div class="step__desc">${escapeHtml(s.desc)}</div>
          </div>
        </div>
      `
      )
      .join("");

    traceResult.innerHTML = `
      <div class="result__header">
        <span class="badge">溯源码：${escapeHtml(item.code)}</span>
        <span class="badge" style="border-color: rgba(34,197,94,.28); background: rgba(232,245,233,.6);">${escapeHtml(item.ecoTag || "生态价值")}</span>
      </div>

      <div class="kv" role="list">
        <div class="kv__k">产品</div><div class="kv__v">${escapeHtml(item.productName)}</div>
        <div class="kv__k">批次</div><div class="kv__v">${escapeHtml(item.batch)}</div>
        <div class="kv__k">产地</div><div class="kv__v">${escapeHtml(item.origin)}</div>
        <div class="kv__k">采摘日期</div><div class="kv__v">${escapeHtml(item.harvestDate)}</div>
        <div class="kv__k">加工方式</div><div class="kv__v">${escapeHtml(item.process)}</div>
        <div class="kv__k">质检摘要</div><div class="kv__v">${escapeHtml(item.qc)}</div>
      </div>

      <div class="timeline" aria-label="溯源链路（演示）">
        ${stepsHtml}
      </div>

      <div class="divider"></div>
      <div class="card__subtitle">检测报告摘要（演示）</div>
      <div class="result__empty" style="color: var(--text)">${escapeHtml(item.report?.summary || "暂无")}</div>
    `;
  }

  function doQuery(codeRaw) {
    const code = String(codeRaw || "").trim();
    if (!code) return;
    const item = findByCode(code);
    if (!item) return renderNotFound(code);
    return renderResult(item);
  }

  if (fillDemo && traceInput) {
    fillDemo.addEventListener("click", () => {
      traceInput.value = "JY-2026-0001";
      traceInput.focus();
      doQuery(traceInput.value);
    });
  }

  if (traceForm && traceInput) {
    traceForm.addEventListener("submit", (e) => {
      e.preventDefault();
      doQuery(traceInput.value);
    });
  }

  // hash 变化也切换页面
  window.addEventListener("hashchange", () => {
    const k = (location.hash || "").replace("#", "").trim();
    if (k && pages.some((p) => p.dataset.page === k)) setActivePage(k, false);
  });
})();

