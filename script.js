let score = 0;

const dataItems = document.querySelectorAll('.data-item');
const categories = document.querySelectorAll('.category');
const scoreEl = document.getElementById('score');
const totalQuestions = dataItems.length; // 総問題数を取得
let correctAnswers = 0; // 正解数をカウント

dataItems.forEach(item => {
  item.addEventListener('dragstart', function (event) {
    event.dataTransfer.setData('text/plain', this.id);
  });
});

categories.forEach(category => {
  category.addEventListener('dragover', function (event) {
    event.preventDefault();
  });

  category.addEventListener('drop', function (event) {
    event.preventDefault();

    const draggedId = event.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(draggedId);

    if (!draggedElement) {
      console.error(`ドラッグされた要素が見つかりません (ID: ${draggedId})`);
      return;
    }

    const draggedCategory = draggedElement.dataset.category;
    const categoryId = this.id;

    // 正しいデータアイテムの検証
    if (draggedCategory === categoryId) {
      // 特別ケース: 日本の人口として「約1億5千万」は不正解
      if (draggedElement.textContent === '約1億5千万' && categoryId === 'population') {
        alert('間違いです！正しい日本の人口ではありません。');
      } else {
        this.appendChild(draggedElement);
        score += 10;
        scoreEl.textContent = score;
        correctAnswers += 1; // 正解数を増やす
        draggedElement.setAttribute('draggable', false);
        draggedElement.style.backgroundColor = '#90ee90';

        // すべて正解したらメッセージを表示
        if (correctAnswers === totalQuestions - 1) { // -1 を考慮
          const gameContainer = document.getElementById('game-container');
          const successMessage = document.createElement('div');
          successMessage.textContent = 'おめでとうございます！全問正解です！';
          successMessage.style.color = '#0078d7';
          successMessage.style.fontSize = '20px';
          successMessage.style.fontWeight = 'bold';
          successMessage.style.marginTop = '20px';
          gameContainer.appendChild(successMessage);
        }
      }
    } else {
      alert('間違いです！正しいカテゴリーに入れてください。');
    }
  });
});
