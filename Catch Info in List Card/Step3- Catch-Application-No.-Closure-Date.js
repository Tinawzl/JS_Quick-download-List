(async function () {
  /********** 通用小工具 **********/
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  const CARD_SELECTOR = "li.overflow-hidden.rounded-xl.border.border-gray-200";

  /********** 第 1 步：一直下拉直到所有卡片加载完 **********/
  async function loadAllCards() {
    let noChangeTimes = 0;
    let lastCount = 0;
    console.log("开始下拉加载所有卡片…");

    while (noChangeTimes < 3) {           // 连续 3 次数量不变就认为到底了
      const cards = document.querySelectorAll(CARD_SELECTOR);
      const count = cards.length;
      console.log("当前卡片数:", count);

      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      await sleep(1800);                  // 等待接口返回+渲染

      const newCount = document.querySelectorAll(CARD_SELECTOR).length;
      if (newCount <= count) {
        noChangeTimes++;
      } else {
        noChangeTimes = 0;
      }
      lastCount = newCount;
    }

    console.log("下拉结束，最终卡片数:", lastCount);
  }

  await loadAllCards();

  /********** 第 2 步：遍历所有卡片，提取两个字段 **********/
  const cards = Array.from(document.querySelectorAll(CARD_SELECTOR));
  console.log("开始提取数据，共", cards.length, "条");

  const rows = [];

  cards.forEach((card, idx) => {
    let applicationNo = null;
    let closureDate = null;

    // 2.1 Application No: 卡片上方蓝色编号（例如 MDDR251211K0012）
    // 先尝试找样式为 text-base font-medium 的 span
    const headerSpan = card.querySelector("span.text-base.font-medium");
    if (headerSpan) {
      applicationNo = headerSpan.textContent.trim();
    } else {
      // 兜底：从整张卡片文本里匹配 MD 开头的编号
      const text = card.innerText;
      const m = text.match(/MD[A-Z0-9]+/);
      if (m) applicationNo = m[0];
    }

    // 2.2 Closure Date: 通过 dt=Closure Date → 同行 dd 的值
    const dts = card.querySelectorAll("dt");
    for (const dt of dts) {
      if (dt.textContent.trim() === "Closure Date") {
        const dd = dt.nextElementSibling;
        if (dd) {
          closureDate = dd.textContent.trim();
          break;
        }
      }
    }

    rows.push({
      index: idx + 1,
      applicationNo,
      closureDate
    });
  });

  console.table(rows);
  window.cardResults = rows;  // 方便你之后在 Console 查看

  /********** 第 3 步：生成并下载 CSV（Excel 可直接打开） **********/
  function exportToCSV(data, filename) {
    const header = ["index", "applicationNo", "closureDate"];
    const csvRows = [];
    csvRows.push(header.join(","));

    data.forEach(row => {
      const line = [
        row.index,
        row.applicationNo || "",
        row.closureDate || ""
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
      csvRows.push(line);
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("CSV 已生成并触发下载：", filename);
  }

  exportToCSV(rows, "closed_applications_list.csv");
})();