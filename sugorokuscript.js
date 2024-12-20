// 必要なDOM要素の参照
const playerSetup = document.getElementById("player-setup");
const nameSetup = document.getElementById("name-setup");
const nameInputsDiv = document.getElementById("name-inputs");
const gameBoard = document.getElementById("game-board");
const canvas = document.getElementById("board-canvas");
const ctx = canvas.getContext("2d");
const questionText = document.getElementById("question");
const answersContainer = document.getElementById("answers-container");
const submitAnswerButton = document.getElementById("submit-answer");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");
const diceDisplay = document.getElementById("dice-display");
const diceImage = document.getElementById("dice-image");
const rollDiceButton = document.getElementById("roll-dice-button");
const currentPlayerNameSpan = document.getElementById("current-player-name");

// サイコロ結果表示用テキスト
const diceResultText = document.createElement("p");
diceResultText.id = "dice-result-text";
diceDisplay.appendChild(diceResultText);

// ゲームデータ
let numPlayers = 0;
const players = [];
const playerColors = ["red", "blue", "green", "orange"];
let currentPlayer = 0;
// マス数を15に変更
const boardSize = 15;
const cellsPerRow = 5;
const cellSize = 100;
const usedQuestions = [];

// 質問リスト
// type: "yesno"の場合はchoicesは["はい","いいえ"]を想定し、answerは0(はい)か1(いいえ)
// type: "choice"の場合は4択
const questions = [
    {
        question: "国勢調査は何年ごとに行われますか？",
        type: "choice",
        choices: ["3年", "5年", "10年", "7年"],
        answer: 1
    },
    {
        question: "国勢調査の初回は何年に行われましたか？",
        type: "choice",
        choices: ["1920年", "1950年", "1900年", "1930年"],
        answer: 0
    },
    {
        question: "国勢調査の回答は義務ですか？",
        type: "yesno",
        // yesnoの場合choicesはこのように固定的に扱う。
        // answerは0が「はい」、1が「いいえ」とする。
        choices: ["はい", "いいえ"],
        answer: 0
    },
    {
        question: "最新の国勢調査は何年に実施されましたか？",
        type: "choice",
        choices: ["2015年", "2020年", "2025年", "1995年"],
        answer: 1
    },
    {
        question: "国勢調査は日本の全ての人が対象ですか？",
        type: "yesno",
        choices: ["はい", "いいえ"],
        answer: 0
    },
    {
        question: "国勢調査はインターネットで回答できますか？",
        type: "yesno",
        choices: ["はい", "いいえ"],
        answer: 0
    },
    {
        question: "国勢調査は無記名で行われますか？",
        type: "yesno",
        choices: ["はい", "いいえ"],
        answer: 1
    },
    {
        question: "1920年から2020年までの間に国勢調査は何回実施？",
        type: "choice",
        choices: ["20回", "21回", "19回", "22回"],
        answer: 1
    },
    {
        question: "2020年国勢調査の基本的な質問項目数は16問ですか？",
        type: "yesno",
        choices: ["はい", "いいえ"],
        answer: 0
    },
    {
        question: "国勢調査はインターネット回答の導入で回答率は上昇した？",
        type: "yesno",
        choices: ["はい", "いいえ"],
        answer: 0
    }
];

// プレイヤー人数選択後に名前入力画面に移動
document.getElementById("choose-names").addEventListener("click", () => {
    numPlayers = parseInt(document.getElementById("num-players").value);
    nameInputsDiv.innerHTML = "";
    for (let i = 0; i < numPlayers; i++) {
        const label = document.createElement("label");
        label.textContent = `プレイヤー${i + 1}の名前: `;
        const input = document.createElement("input");
        input.type = "text";
        input.id = `player-name-${i}`;
        input.placeholder = `プレイヤー${i + 1}`;
        input.required = true;

        nameInputsDiv.appendChild(label);
        nameInputsDiv.appendChild(input);
        nameInputsDiv.appendChild(document.createElement("br"));
    }

    playerSetup.style.display = "none";
    nameSetup.style.display = "block";
});

// ゲーム開始
document.getElementById("start-game").addEventListener("click", () => {
    players.length = 0;

    for (let i = 0; i < numPlayers; i++) {
        const nameInput = document.getElementById(`player-name-${i}`);
        const name = nameInput.value.trim();

        if (name === "") {
            alert(`プレイヤー${i + 1}の名前を入力してください！`);
            return;
        }

        players.push({ name, position: 0, color: playerColors[i] });
    }

    nameSetup.style.display = "none";
    gameBoard.style.display = "block";

    canvas.width = cellsPerRow * cellSize;
    canvas.height = Math.ceil(boardSize / cellsPerRow) * cellSize;

    drawBoardAndPlayers();
    showQuestion();
});

// ボードとプレイヤーの描画
function drawBoardAndPlayers() {
    // ボードを描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.font = "20px Arial";

    for (let i = 0; i < boardSize; i++) {
        const x = (i % cellsPerRow) * cellSize;
        const y = Math.floor(i / cellsPerRow) * cellSize;

        ctx.strokeRect(x, y, cellSize, cellSize);

        if (i === boardSize - 1) {
            ctx.fillText("ゴール", x + 10, y + 30);
        } else {
            ctx.fillText(i + 1, x + 10, y + 30);
        }
    }

    // プレイヤーを描画(プレイヤー名も表示)
    players.forEach((player, index) => {
        const x = (player.position % cellsPerRow) * cellSize + cellSize / 2;
        const y = Math.floor(player.position / cellsPerRow) * cellSize + cellSize / 2;

        // プレイヤー駒
        ctx.beginPath();
        ctx.arc(x + index * 15 - 15, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();

        // プレイヤー名を表示（駒の上部）
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(player.name, x + index * 15 - 15, y - 15);
    });
}

// 質問を表示
function showQuestion() {
    if (usedQuestions.length === questions.length) {
        usedQuestions.length = 0; // 質問リストをリセット
    }

    let questionIndex;
    do {
        questionIndex = Math.floor(Math.random() * questions.length);
    } while (usedQuestions.includes(questionIndex));

    usedQuestions.push(questionIndex);

    const question = questions[questionIndex];
    players[currentPlayer].currentQuestion = question;

    questionText.textContent = question.question;
    feedback.textContent = "";
    diceDisplay.style.display = "none";
    rollDiceButton.disabled = false;

    // 選択肢表示をリセット
    answersContainer.innerHTML = "";

    // 質問タイプで分岐
    if (question.type === "yesno") {
        // はい・いいえのみ
        const yesLabel = document.createElement("label");
        const yesRadio = document.createElement("input");
        yesRadio.type = "radio";
        yesRadio.name = "answer";
        yesRadio.value = 0;
        yesLabel.appendChild(yesRadio);
        yesLabel.appendChild(document.createTextNode("はい"));
        answersContainer.appendChild(yesLabel);
        answersContainer.appendChild(document.createElement("br"));

        const noLabel = document.createElement("label");
        const noRadio = document.createElement("input");
        noRadio.type = "radio";
        noRadio.name = "answer";
        noRadio.value = 1;
        noLabel.appendChild(noRadio);
        noLabel.appendChild(document.createTextNode("いいえ"));
        answersContainer.appendChild(noLabel);
        answersContainer.appendChild(document.createElement("br"));

    } else {
        // 4択問題
        question.choices.forEach((choice, idx) => {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "answer";
            radio.value = idx;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(choice));
            answersContainer.appendChild(label);
            answersContainer.appendChild(document.createElement("br"));
        });
    }

    currentPlayerNameSpan.textContent = players[currentPlayer].name;
}

// 回答をチェック
submitAnswerButton.addEventListener("click", () => {
    const radios = document.getElementsByName("answer");
    let selectedValue = null;
    for (let r of radios) {
        if (r.checked) {
            selectedValue = parseInt(r.value, 10);
            break;
        }
    }

    if (selectedValue === null) {
        feedback.textContent = "回答を選択してください。";
        return;
    }

    const question = players[currentPlayer].currentQuestion;
    if (selectedValue === question.answer) {
        feedback.textContent = "正解！サイコロを振ってください。";
        diceDisplay.style.display = "block";
        rollDiceButton.disabled = false;
    } else {
        feedback.textContent = `不正解！ 正解は「${question.choices[question.answer]}」です。`;
        nextButton.style.display = "inline-block";
    }
});

// サイコロを1回だけ振る
rollDiceButton.addEventListener("click", () => {
    if (rollDiceButton.disabled) return;
    rollDiceButton.disabled = true; // 振ったら即無効化

    const diceRoll = Math.floor(Math.random() * 6) + 1;

    // サイコロの目を即時表示
    diceImage.src = `images/dicenome_0${diceRoll}.png`;
    diceImage.alt = `サイコロの目: ${diceRoll}`;
    diceResultText.textContent = `サイコロの目: ${diceRoll}`;
    diceDisplay.style.display = "block";  // 常に表示

    players[currentPlayer].position += diceRoll;

    if (players[currentPlayer].position >= boardSize - 1) {
        alert(`${players[currentPlayer].name} がゴールしました！`);
        players[currentPlayer].position = boardSize - 1;
    }

    drawBoardAndPlayers();

    nextButton.style.display = "inline-block";
});

// 次のプレイヤーに移動
nextButton.addEventListener("click", () => {
    currentPlayer = (currentPlayer + 1) % numPlayers;
    showQuestion();
    nextButton.style.display = "none";
});
