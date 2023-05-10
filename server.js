const express = require("express");
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
const hbs = require("express-handlebars");

const app = express();
const PORT = 5000;
const fileExtensions =
    "cssdirdocexegifhtmljpgjsmp3mp4pdfphppngpssqlsvgtxtxmlzip";

app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.engine(
    "hbs",
    hbs({
        extname: ".hbs",
        defaultLayout: "main.hbs",
        partialsDir: "views/partials",
        helpers: {
            getExtension: (filename) => {
                const extension = filename.split(".")[1] || " ";
                return fileExtensions.includes(extension) ? extension : "other";
            },
        },
    })
);

const uploadPath = path.join(__dirname, "upload");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const getFiles = (path) => {
    const data = { dirs: [], files: [] };
    fs.readdirSync(path, { withFileTypes: true }).map((e) => {
        e.isDirectory() ? data.dirs.push(e.name) : data.files.push(e.name);
    });
    console.log(data);
    return data;
};

/*Add the (number) to the file when it already exists*/
const fixFileName = (fileName, dir) => {
    var newPath = path.join(uploadPath, fileName);
    var newName = fileName.split(".")[0];
    var fileExt = fileName.split(".")[1] || "";
    var i = 0;
    while (fs.existsSync(newPath)) {
        i += 1;
        if (dir) {
            if (newPath.at(-3) == "(" && newPath.at(-1) == ")") {
                newPath = newPath.substring(0, newPath.length - 3) + `(${i})`;
            } else {
                newPath += `(${i})`;
            }
        } else {
            if (newName.at(-3) == "(" && newName.at(-1) == ")") {
                newPath = path.join(
                    uploadPath,
                    newName.substring(0, newName.length - 3) +
                        `(${i})` +
                        "." +
                        fileExt
                );
            } else {
                newPath = path.join(
                    uploadPath,
                    newName + `(${i})` + "." + fileExt
                );
            }
        }
    }
    return newPath;
};

app.get("/", (req, res) => {
    res.render("index.hbs", { data: getFiles(uploadPath) });
});

app.post("/", (req, res) => {
    /*Create new dir*/
    console.log(req.body);
    if (req.body.request === "dir") {
        const fileName = req.body.name;
        const newPath = fixFileName(fileName, true);
        fs.mkdirSync(newPath);
        return res.render("index.hbs", { data: getFiles(uploadPath) });

        /*Create new file*/
    } else if (req.body.request === "file") {
        var fileName = req.body.name;

        if (fileName.lastIndexOf(".") == fileName.length - 1) {
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }

        const newPath = fixFileName(fileName, false);

        fs.writeFileSync(newPath, "");
        return res.render("index.hbs", { data: getFiles(uploadPath) });

        /*Remove file*/
    } else if (req.body.request === "remove") {
        console.log(req.body);
        const fileName = req.body.name;
        const newPath = path.join(uploadPath, fileName);

        if (fs.existsSync(newPath)) {
            if (fs.lstatSync(newPath).isDirectory()) {
                fs.rmdirSync(newPath);
            } else {
                fs.unlinkSync(newPath);
            }
        }

        return res.render("index.hbs", { data: getFiles(uploadPath) });

        /*Add files from your computer*/
    } else {
        let form = formidable({
            multiples: true,
            keepExtensions: true,
            uploadDir: uploadPath,
        });

        form.parse(req, (err, fields, files) => {
            if (files.entities.length > 1) {
                files.entities.forEach((file) => {
                    const newPath = fixFileName(file.name, false);

                    fs.renameSync(file.path, newPath);
                });
            } else {
                const newPath = fixFileName(files.entities.name, false);

                fs.renameSync(files.entities.path, newPath);
            }

            return res.render("index.hbs", { data: getFiles(uploadPath) });
        });
    }
});

app.listen(PORT, () => {
    console.log("Server starting... PORT: " + PORT);
});
