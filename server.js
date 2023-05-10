const express = require("express");
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
const hbs = require("express-handlebars");

const app = express();
const PORT = 5000;
const fileExtensions = [
    "css",
    "dir",
    "doc",
    "exe",
    "gif",
    "html",
    "jpg",
    "js",
    "mp3",
    "mp4",
    "pdf",
    "php",
    "png",
    "ps",
    "sql",
    "svg",
    "txt",
    "xml",
    "zip",
];

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
var currentPath = path.join(__dirname, "upload");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const getFiles = (newPath) => {
    const data = { dirs: [], files: [] };
    fs.readdirSync(newPath, { withFileTypes: true }).map((e) => {
        e.isDirectory()
            ? data.dirs.push({
                  name: e.name,
                  path: path.join(newPath, e.name).split("\\upload\\")[1],
              })
            : data.files.push(e.name);
    });
    return data;
};

const getPathArray = (newPath) => {
    const data = [];
    newPath = newPath.split("\\upload\\")[1];
    if (newPath) {
        newPath = newPath.split("\\");
        newPath
            .slice()
            .reverse()
            .map((el) => {
                const totalPath = {
                    name: el,
                    path: path.join.apply(null, newPath).replace("\\", "/"),
                };
                data.push(totalPath);
                newPath.pop();
            });
    }
    data.push({ name: "Home", path: "/" });
    data.reverse();
    console.log(data);
    return data;
};

/*Add the (number) to the file when it already exists*/
const fixFileName = (fileName, dir) => {
    var newPath = path.join(currentPath, fileName);
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
                    currentPath,
                    newName.substring(0, newName.length - 3) +
                        `(${i})` +
                        "." +
                        fileExt
                );
            } else {
                newPath = path.join(
                    currentPath,
                    newName + `(${i})` + "." + fileExt
                );
            }
        }
    }
    return newPath;
};

app.get("/", (req, res) => {
    currentPath = path.join(uploadPath, req.query.path || "");
    res.render("index.hbs", {
        data: getFiles(currentPath),
        path: getPathArray(currentPath),
    });
});

app.post("/", (req, res) => {
        /*Create new dir*/
    if (req.body.request === "dir") {
        const newPath = fixFileName(req.body.name, true);
        fs.mkdirSync(newPath);
        return res.render("index.hbs", {
            data: getFiles(currentPath),
            path: getPathArray(currentPath),
        });

        /*Create new file*/
    } else if (req.body.request === "file") {
        const newPath = fixFileName(req.body.name, false);

        fs.writeFileSync(newPath, "");
        return res.render("index.hbs", {
            data: getFiles(currentPath),
            path: getPathArray(currentPath),
        });

        /*Remove file*/
    } else if (req.body.request === "remove") {
        const fileName = req.body.name;
        const newPath = path.join(currentPath, fileName);

        if (fs.existsSync(newPath)) {
            if (fs.lstatSync(newPath).isDirectory()) {
                fs.rmdirSync(newPath);
            } else {
                fs.unlinkSync(newPath);
            }
        }

        return res.render("index.hbs", {
            data: getFiles(currentPath),
            path: getPathArray(currentPath),
        });

        /*Add files from your computer*/
    } else {
        let form = formidable({
            multiples: true,
            keepExtensions: true,
            uploadDir: currentPath,
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

            return res.render("index.hbs", {
                data: getFiles(currentPath),
                path: getPathArray(currentPath),
            });
        });
    }
});

app.listen(PORT, () => {
    console.log("Server starting... PORT: " + PORT);
});
