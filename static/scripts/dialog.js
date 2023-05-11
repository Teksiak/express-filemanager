const newDir = document.querySelector("button#dir");
const newFile = document.querySelector("button#file");
const changeName = document.querySelector("button#change");
const uploadFiles = document.querySelector("button#upload");
const dialog = document.querySelector("dialog");
const cancelDialog = document.querySelector("button#cancel");
const submitDialog = document.querySelector("button#submit");
const dialogForm = document.querySelector("form#dialogForm");

function showDialog(type) {
    if (type === "dir") {
        submitDialog.value = "dir";
    } else if (type === "file") {
        submitDialog.value = "file";
    } else if (type === "change") {
        submitDialog.value = "change";
    }
    dialog.showModal();
}

function confirmForm(form) {
    if (confirm("Are you sure you want to delete this file?")) {
        return true;
    } else {
        return false;
    }
}

newDir.addEventListener("click", () => showDialog("dir"));
newFile.addEventListener("click", () => showDialog("file"));
try {
    changeName.addEventListener("click", () => showDialog("change"));
}
catch {}
dialog.addEventListener("close", () => dialogForm.reset());
cancelDialog.addEventListener("click", () => {
    dialog.close();
});