/************ 等待元素 ************/
function waitFor(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const start = performance.now();
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(timer);
                resolve(el);
            }
            if (performance.now() - start > timeout) {
                clearInterval(timer);
                reject("Timeout waiting for " + selector);
            }
        }, 200);
    });
}

function click(el) {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    el.click();
}

/************ 主流程 ************/
(async function(){

    console.log("Step 1 ▶ 点击顶部 Search");

    // 🔥 改成“遍历按钮寻找 Search”
    const topSearchBtn = [...document.querySelectorAll("button")]
        .find(btn => btn.innerText.trim() === "Search");
    click(topSearchBtn);

    await new Promise(r => setTimeout(r, 600));


    console.log("Step 2 ▶ Application Type = Distribution Records");

    const appTypeBtn =
        document.querySelector("label[for='applicationType']")
        .parentElement.querySelector("button");
    click(appTypeBtn);

    await waitFor("ul li");

    const distItem = [...document.querySelectorAll("ul li")]
        .find(li => li.innerText.trim() === "Distribution Records");
    click(distItem);

    await new Promise(r => setTimeout(r, 500));


    console.log("Step 3 ▶ Submission Type = Special Access Route");

    const subTypeBtn =
        document.querySelector("label[for='submissionType']")
        .parentElement.querySelector("button");
    click(subTypeBtn);

    await waitFor("ul li");

    const specialItem = [...document.querySelectorAll("ul li")]
        .find(li => li.innerText.trim() === "Special Access Route");
    click(specialItem);

    await new Promise(r => setTimeout(r, 500));


    console.log("Step 4 ▶ 点击底部 Search");

    // 精准锁定底部那一组按钮
    const bottomSearchBtn = [...document.querySelectorAll("button")]
        .filter(btn => btn.innerText.trim() === "Search")
        .pop(); // 取最后一个按钮
    click(bottomSearchBtn);

    console.log("✔ 完成");

})();
