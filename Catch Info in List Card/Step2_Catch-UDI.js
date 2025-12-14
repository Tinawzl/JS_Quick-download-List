/******************** 通用工具 ********************/
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForConditionInWin(win, checkFn, timeout = 15000, interval = 300) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (win.closed) return null;
      const res = checkFn(win);
      if (res) return res;
    } catch (e) {}
    await sleep(interval);
  }
  return null;
}

/******************** 列表页：卡片处理 ********************/
const CARD_SELECTOR = "li.overflow-hidden.rounded-xl.border.border-gray-200";

function getAllCards() {
  return Array.from(document.querySelectorAll(CARD_SELECTOR));
}

async function ensureCardLoaded(index) {
  let attempts = 0;
  while (getAllCards().length <= index && attempts < 10) {
    console.log(`当前卡片数=${getAllCards().length}，下拉加载更多…`);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    await sleep(1800);
    attempts++;
  }
  return getAllCards()[index] || null;
}

function getViewLinkFromCard(card) {
  return card.querySelector("a[href*='ViewApplication']");
}

/******************** 详情页处理：选择 SAR + 抓取字段 ********************/

// ⭐⭐ 新增：精准点击 SAR Distribution Record（根据你的 HTML 结构）
async function clickSarDistributionTabInWin(win) {
  const tabBtn = await waitForConditionInWin(
    win,
    w => w.document.querySelector("#navButton-section-sar-distribution-record"),
    10000
  );

  if (!tabBtn) {
    console.warn("未找到 SAR Distribution Record 按钮");
    return;
  }

  tabBtn.click();
  await sleep(1500);
}

// 通过 <dt> → <dd> 抓值
function getDdValue(win, label) {
  const dts = Array.from(win.document.querySelectorAll("dt"));
  for (const dt of dts) {
    if (dt.textContent.trim() === label) {
      const dd = dt.nextElementSibling;
      if (dd) return dd.textContent.trim();
    }
  }
  return null;
}

function extractApplicationNoInWin(win) {
  const doc = win.document;
  const candidates = Array.from(doc.querySelectorAll("span, div, dd"))
    .filter(el => el.innerText && el.innerText.includes("Application No"));

  if (candidates.length) {
    const text = candidates[0].innerText.trim();
    const m = text.match(/MD[A-Z0-9]+/);
    if (m) return m[0];
  }

  const all = Array.from(doc.querySelectorAll("span, div, dd"));
  for (const el of all) {
    const t = el.innerText?.trim();
    if (!t) continue;
    const m = t.match(/MD[A-Z0-9]+/);
    if (m) return m[0];
  }

  console.warn("未找到 Application No");
  return null;
}

function extractLicenceNumberInWin(win) {
  const val = getDdValue(win, "Licence Number");
  if (val) return val;
  console.warn("未找到 Licence Number");
  return null;
}

// 总控制
async function processDetailInNewTab(url, indexForLog) {
  console.log(`→ 打开第 ${indexForLog + 1} 个详情页面`);

  const win = window.open(url, "_blank");
  if (!win) {
    console.error("弹出窗口被阻止！请允许本网站的 pop-ups");
    return null;
  }

  // 等待加载
  await waitForConditionInWin(win, w => w.document.readyState === "complete", 15000);

  // 点击左侧 SAR Distribution Record
  await clickSarDistributionTabInWin(win);

  // 抓取两个值
  const applicationNo = extractApplicationNoInWin(win);
  const licenceNumber = extractLicenceNumberInWin(win);

  win.close();

  return { applicationNo, licenceNumber };
}

/******************** 主流程 ********************/
window.sarResults = [];

(async function main() {
  console.log("===== 开始批量采集（方案B：新 tab，不丢脚本）=====");

  let index = 0;

  while (true) {
    console.log(`\n====== 处理第 ${index + 1} 个条目 ======`);

    const card = await ensureCardLoaded(index);
    if (!card) {
      console.log("没有更多卡片，任务结束");
      break;
    }

    card.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(500);

    const link = getViewLinkFromCard(card);
    if (!link) {
      console.warn("未找到 View 按钮，跳过");
      index++;
      continue;
    }

    const detail = await processDetailInNewTab(link.href, index);
    if (detail) {
      window.sarResults.push({
        index: index + 1,
        applicationNo: detail.applicationNo,
        licenceNumber: detail.licenceNumber
      });
      console.table([window.sarResults[window.sarResults.length - 1]]);
    }

    await sleep(600);
    index++;
  }

  console.log("🎉 所有数据采集完成！");
  console.table(window.sarResults);

  /******************** 输出 CSV ********************/
  const csvRows = [];
  csvRows.push("index,applicationNo,licenceNumber");

  for (const row of window.sarResults) {
    csvRows.push(`${row.index},${row.applicationNo},${row.licenceNumber}`);
  }

  const csvContent = csvRows.join("\n");
  console.log("===== CSV 格式输出如下（可复制进 Excel）=====");
  console.log(csvContent);

  window.__csvOutput = csvContent;
})();
