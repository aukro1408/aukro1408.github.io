// === Плагин "Кот приветствует (встроенные звуки)" ===
(function () {
  const ID = "lampa-cat-welcome-local";
  if (window[ID]) return;
  window[ID] = true;

  // короткое "мяу" (пример заглушки)
  const meowBase64 =
    "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjE0LjEwMAAAAAAAAAAAAAAA//NAxAAABY...";
  // короткое "урчание" (пример заглушки)
  const purrBase64 =
    "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjE0LjEwMAAAAAAAAAAAAAAA//NAxAAABY...";

  const meow = new Audio(meowBase64);
  const purr = new Audio(purrBase64);

  meow.volume = 0.7;
  purr.volume = 0.45;
  purr.loop = true;

  let played = false;

  function playCat() {
    if (played) return;
    played = true;

    meow.play().then(() => {
      setTimeout(() => {
        purr.play();
        setTimeout(() => {
          purr.pause();
          purr.currentTime = 0;
        }, 5000);
      }, 1000);
    });
  }

  // звук при первом взаимодействии пользователя
  ["click", "keydown", "touchstart"].forEach((e) =>
    document.addEventListener(e, playCat, { once: true })
  );
})();
