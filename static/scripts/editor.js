const textarea = document.querySelector("textarea");
const lineNumbers = document.querySelector("#numbers");
const dialog = document.querySelector("dialog");
const dialogForm = document.querySelector("form#dialogForm");
const cancelDialog = document.querySelector("button#cancel");
const submitDialog = document.querySelector("button#submit");
const changeName = document.querySelector("button#changefile");
const extDiv = document.querySelector("div#extDiv");
const decrease = document.querySelector("button#decrease");
const increase = document.querySelector("button#increase");
const switchtheme = document.querySelector("button#switch");
const numbers = document.querySelector("div#numbers");
const editor = document.querySelector("div#editor");
const fileName = document.querySelector("input#fileName");

const numberOfLines = textarea.value.split("\n").length;
textarea.rows = numberOfLines;
lineNumbers.innerHTML = Array(numberOfLines).fill("<span></span>").join("");

textarea.addEventListener("keyup", (event) => {
    const numberOfLines = event.target.value.split("\n").length;
    textarea.rows = numberOfLines;

    lineNumbers.innerHTML = Array(numberOfLines).fill("<span></span>").join("");
});

decrease.addEventListener("click", (event) => {
    var size = parseInt(textarea.style.fontSize.slice(0, -2));
    if (size > 12) {
        textarea.style.fontSize = `${size - 2}px`;
        numbers.style.fontSize = `${size - 2}px`;
    }
    saveTheme(undefined, size - 2);
});
increase.addEventListener("click", (event) => {
    var size = parseInt(textarea.style.fontSize.slice(0, -2));
    if (size < 36) {
        textarea.style.fontSize = `${size + 2}px`;
        numbers.style.fontSize = `${size + 2}px`;
    }
    saveTheme(undefined, size + 2);
});

async function saveTheme(theme, font) {
    fetch("http://localhost:5000/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            request: "savetheme",
            name: fileName.value,
            contents: textarea.value,
            theme: theme,
            font: parseInt(textarea.style.fontSize.slice(0, -2)),
        }),
    });
}

switchtheme.addEventListener("click", (event) => {
    console.log(editor.classList);
    if (
        !editor.classList.contains("dark-theme") &&
        editor.classList.contains("normal-theme")
    ) {
        editor.classList.replace("normal-theme", "dark-theme");
        editor.classList.add("bg-dark");
        textarea.classList.add("bg-dark", "text-light");
        saveTheme("dark-theme");
    } else if (
        !editor.classList.contains("contrast-theme") &&
        editor.classList.contains("dark-theme")
    ) {
        editor.classList.replace("dark-theme", "contrast-theme");
        textarea.classList.replace("text-light", "text-warning");
        numbers.classList.replace("text-muted", "text-white");
        saveTheme("contrast-theme");
    } else {
        editor.classList.replace("contrast-theme", "normal-theme");
        editor.classList.remove("bg-dark");
        textarea.classList.remove("bg-dark", "text-warning");
        numbers.classList.replace("text-white", "text-muted");
        saveTheme("normal-theme");
    }
});

function showDialog(type) {
    if (type === "changefile") {
        submitDialog.value = "changefile";
    }
    dialog.showModal();
}

changeName.addEventListener("click", () => showDialog("changefile"));
dialog.addEventListener("close", () => dialogForm.reset());
cancelDialog.addEventListener("click", () => {
    dialog.close();
});
