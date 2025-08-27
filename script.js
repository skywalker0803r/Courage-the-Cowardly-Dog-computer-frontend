document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const log = document.getElementById("log");
  const settingsButton = document.getElementById("settingsButton");

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

      const user_id = localStorage.getItem("user_id") || (() => {
      const newId = "user_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("user_id", newId);
      return newId;
    })();

      try {
        const response = await fetch("https://courage-the-cowardly-dog-computer-backend.onrender.com/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            user_id  // 👈 加上這一行，讓後端記住你
          }),
        });

        const data = await response.json();
        if (data.reply) {
          // 如果有音訊，先播放
          if (data.audio) {
            const audioSrc = `data:audio/mp3;base64,${data.audio}`;
            const audio = new Audio(audioSrc);
            audio.play();
          }
          // 同步打字機效果
          typeWriter(`🖥️ ${data.reply}`);
        } else {
          log.innerText += "🖥️ Error: " + data.error + "\n\n";
        }
      } catch (err) {
        log.innerText += "🖥️ Network error.\n\n";
      }
    }
  });

  settingsButton.addEventListener("click", async () => {
    const instruction = prompt("Enter new system instruction:");
    if (instruction !== null) { // User didn't cancel
      const user_id = localStorage.getItem("user_id") || (() => {
        const newId = "user_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem("user_id", newId);
        return newId;
      })();
      try {
        const response = await fetch("https://courage-the-cowardly-dog-computer-backend.onrender.com/set_instruction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instruction, user_id }),
        });
        const data = await response.json();
        if (data.status === "success") {
          alert("System instruction updated successfully!");
          log.innerText = ""; // Clear conversation history
          
        } else {
          alert("Failed to update system instruction: " + data.error);
        }
      } catch (error) {
        alert("Network error while updating system instruction.");
      }
    }
  });
});


