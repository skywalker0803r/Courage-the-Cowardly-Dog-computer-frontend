const input = document.getElementById("input");
const log = document.getElementById("log");

// 動態輸出文字（打字機效果）
function typeWriter(text, callback) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      log.innerText += text.charAt(i);
      i++;
      log.scrollTop = log.scrollHeight;
      setTimeout(typing, 30);
    } else {
      log.innerText += "\n\n";
      log.scrollTop = log.scrollHeight;
      if (callback) callback();
    }
  }
  typing();
}

// 更新閃爍游標位置
input.addEventListener('input', () => {
  const pos = input.selectionStart;
  input.style.setProperty('--caret-pos', pos);
});
input.addEventListener('keydown', () => {
  const pos = input.selectionStart;
  input.style.setProperty('--caret-pos', pos);
});

input.addEventListener("keydown", async function (e) {
  if (e.key === "Enter") {
    const message = input.value.trim();
    if (!message) return;
    log.innerText += `> ${message}\n`;
    input.value = "";
    input.style.setProperty('--caret-pos', 0);

    try {
      const response = await fetch("https://courage-the-cowardly-dog-computer-backend.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (data.reply) {
        typeWriter(`🖥️ ${data.reply}`);
      } else {
        log.innerText += "🖥️ Error: " + data.error + "\n\n";
      }
    } catch (err) {
      log.innerText += "🖥️ Network error.\n\n";
    }
  }
});
