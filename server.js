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

const fileSamples = {
    txt: "This is your txt file.",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>This is your HTML page.</h1>
</body>
</html>
    `,
    css: `/* Applies to the entire body of the HTML document (except where overridden by more specific
selectors). */
body {
    margin: 25px;
    background-color: rgb(240,240,240);
    font-family: arial, sans-serif;
    font-size: 14px;
}

/* Applies to all <h1>...</h1> elements. */
h1 {
    font-size: 35px;
    font-weight: normal;
    margin-top: 5px;
}

/* Applies to all elements with <... class="someclass"> specified. */
.someclass { color: red; }

/* Applies to the element with <... id="someid"> specified. */
#someid { color: green; }
    `,
    js: `console.log('This is your js file');`,
    json: `{
    "fruit": "Apple",
    "size": "Large",
    "color": "Red"
}`,
    xml: `<note>
    <to>You</to>
    <from>Andrew</from>
    <heading>Hello</heading>
    <body>This is your xml file!</body>
</note>
    `,
};

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
            getExtension: (fileName) => {
                const extension = fileName.split(".")[1] || " ";
                return fileExtensions.includes(extension) ? extension : "other";
            },
            checkLength: (path) => {
                if (path.length == 1) {
                    return false;
                }
                return true;
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
const fixFileName = (fileName, dir, customPath = "") => {
    var newPath = path.join(currentPath, fileName);
    if (customPath != "") {
        newPath = path.join(customPath, fileName);
    }
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
        console.log(req.body);
        const newPath = fixFileName(req.body.name + req.body.extension, false);

        fs.writeFileSync(newPath, "");
        fs.appendFileSync(newPath, fileSamples[req.body.extension.slice(1)]);
        return res.render("index.hbs", {
            data: getFiles(currentPath),
            path: getPathArray(currentPath),
        });

        /*Change folder name*/
    } else if (req.body.request === "change") {
        const newPath = fixFileName(
            req.body.name,
            true,
            path.join(currentPath, "../")
        );

        if (fs.existsSync(currentPath)) {
            fs.rename(currentPath, newPath, (err) => {
                if (err) console.log(err);
                else {
                    currentPath = newPath;
                    return res.render("index.hbs", {
                        data: getFiles(currentPath),
                        path: getPathArray(currentPath),
                    });
                }
            });
        }

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
            if (files.files.length > 1) {
                files.files.forEach((file) => {
                    const newPath = fixFileName(file.name, false);

                    fs.renameSync(file.path, newPath);
                });
            } else {
                const newPath = fixFileName(files.files.name, false);

                fs.renameSync(files.files.path, newPath);
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
