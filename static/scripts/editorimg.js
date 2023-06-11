const dialog = document.querySelector("dialog");
const dialogForm = document.querySelector("form#dialogForm");
const cancelDialog = document.querySelector("button#cancel");
const submitDialog = document.querySelector("button#submit");
const changeName = document.querySelector("button#changefile");
const extDiv = document.querySelector("div#extDiv");
const fileName = document.querySelector("input#file-name");
const showFilters = document.querySelector("button#showfilters")
const filtersDiv = document.querySelector("div#filters-div")
const secondDiv = document.querySelector("div#second-div")
const mainImage = document.getElementById("main-image")
const saveButton = document.querySelector("button#save-button")
const editor = document.querySelector("div#editor")

const filters = ['grayscale', 'invert', 'sepia', 'none']
var shown = false
var currentFilter = filters[3]

function showDialog(type) {
    if (type === "changefile") {
        submitDialog.value = "changefile";
    }
    dialog.showModal();
}

function toDataURL(src, filter){
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var image = new Image();
    image.src = src;
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    context.filter = currentFilter=='none' ? 'none' : `${currentFilter}(100%)`;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    console.log(canvas.toDataURL('image/png'))
    return canvas.toDataURL('image/png');
}

function saveImage () {
    const dataUrl = toDataURL(mainImage.src.split("5000")[1],  currentFilter)
    fetch("http://localhost:5000/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            request: "saveimage",
            name: fileName.value,
            dataUrl: dataUrl
        }),
    });
}

saveButton.addEventListener("click", () => {
    saveImage()
    location.reload()
})

showFilters.addEventListener("click", () => {
    if(shown) {
        filtersDiv.setAttribute("style", "left: -300px;")
        setTimeout(() => {
            secondDiv.setAttribute("style", "margin-top: 0px")
        }, 100)
    } else {
        secondDiv.setAttribute("style", "margin-top: 160px")    
        setTimeout(() => {
            filtersDiv.setAttribute("style", "left: 0px;") 
        }, 300)   
    }
    shown = !shown
})

for(const filter of filters) {
    console.log(filter)
    document.querySelector(`#${filter}`).addEventListener("click", () => {
        mainImage.style.filter = filter=='none' ? filter : `${filter}(100%)`
        currentFilter = filter
    })
}

changeName.addEventListener("click", () => showDialog("changefile"));
dialog.addEventListener("close", () => dialogForm.reset());
cancelDialog.addEventListener("click", () => {
    dialog.close();
});
