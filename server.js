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

const supportedImages = ["jpg", "png"]

const fileSamples = {
    txt: "This is your txt file.",
    html:
        "<!DOCTYPE html>\n" +
        '<html lang="en">\n' +
        "<head>\n" +
        '    <meta charset="UTF-8">\n' +
        '    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        "    <title>Document</title>\n" +
        "</head>\n" +
        "<body>\n" +
        "    <h1>This is your HTML page.</h1>\n" +
        "</body>\n" +
        "</html>\n",
    css:
        "/* Applies to the entire body of the HTML document (except where overridden by more specific\n" +
        "selectors). */\n" +
        "body {\n" +
        "    margin: 25px;\n" +
        "    background-color: rgb(240,240,240);\n" +
        "    font-family: arial, sans-serif;\n" +
        "    font-size: 14px;\n" +
        "}\n" +
        "\n" +
        "/* Applies to all <h1>...</h1> elements. */\n" +
        "h1 {\n" +
        "    font-size: 35px;\n" +
        "    font-weight: normal;\n" +
        "    margin-top: 5px;\n" +
        "}\n" +
        "\n" +
        '/* Applies to all elements with <... class="someclass"> specified. */\n' +
        ".someclass { color: red; }\n" +
        "\n" +
        '/* Applies to the element with <... id="someid"> specified. */\n' +
        "#someid { color: green; }\n",
    js: "console.log('This is your js file');",
    json:
        "{\n" +
        '    "fruit": "Apple",\n' +
        '    "size": "Large",\n' +
        '    "color": "Red"\n' +
        "}\n",
    xml:
        "<note>\n" +
        "    <to>You</to>\n" +
        "    <from>Andrew</from>\n" +
        "    <heading>Hello</heading>\n" +
        "    <body>This is your xml file!</body>\n" +
        "</note>\n",
};

const filters = ['grayscale', 'invert', 'sepia', 'none']

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("upload"));
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
            setEditorTheme: (theme) => {
                if (theme == "normal-theme") {
                    return "d-flex flex-row p-1 normal-theme";
                } else if (theme == "dark-theme") {
                    return "d-flex flex-row p-1 dark-theme bg-dark";
                } else {
                    return "d-flex flex-row p-1 contrast-theme bg-dark";
                }
            },
            setNumbersTheme: (theme) => {
                if (theme == "normal-theme") {
                    return "text-muted";
                } else if (theme == "dark-theme") {
                    return "text-muted";
                } else {
                    return "text-white";
                }
            },
            setAreaTheme: (theme) => {
                if (theme == "normal-theme") {
                    return "ps-2";
                } else if (theme == "dark-theme") {
                    return "ps-2 bg-dark text-light";
                } else {
                    return "ps-2 bg-dark text-warning";
                }
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
    console.log(req.query);
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

        /*Show file editor*/
    } else if (req.body.request === "edit") {
        const newPath = path.join(currentPath, req.body.name);
        const extension = req.body.name.split(".")[1]
        if(supportedImages.includes(extension)) {
            const view = newPath.split("\\upload")[1]
            return res.render("editorimg.hbs", {
                path: getPathArray(currentPath),
                preview: newPath,
                name: req.body.name,
                view: view.replaceAll("\\", "/"),
                filters: filters
            });
        }
        else {
            const data = fs.readFileSync(newPath, "utf8");
            const theme = JSON.parse(
                fs.readFileSync(path.join(__dirname, "static/themes.json"), "utf8")
            );

            if (theme[newPath]) {
                return res.render("editor.hbs", {
                    path: getPathArray(currentPath),
                    preview: newPath,
                    name: req.body.name,
                    contents: data,
                    theme: theme[newPath].theme,
                    font: theme[newPath].font,
                });
            } else {
                return res.render("editor.hbs", {
                    path: getPathArray(currentPath),
                    preview: newPath,
                    name: req.body.name,
                    contents: data,
                    theme: "normal-theme",
                    font: 16,
                });
            }
        }

        /*File preview*/
    } else if (req.body.request === "preview") {
        const newPath = path.join(currentPath, req.body.name);

        return res.sendFile(newPath);

        /*Change file name*/
    } else if (req.body.request === "changefile") {
        const newPath = fixFileName(
            req.body.name + "." + req.body.extension,
            false,
            currentPath
        );
        const oldPath = path.join(currentPath, req.body.oldname);
        const themePath = path.join(__dirname, "static/themes.json");
        var theme = JSON.parse(fs.readFileSync(themePath, "utf8"));
        theme[newPath] = theme[oldPath];
        fs.writeFileSync(themePath, JSON.stringify(theme, null, 4));

        if (fs.existsSync(oldPath)) {
            fs.rename(oldPath, newPath, (err) => {
                if (err) console.log(err);
                else {
                    if(supportedImages.includes(req.body.extension)) {
                        const view = newPath.split("\\upload")[1]
                        return res.render("editorimg.hbs", {
                            path: getPathArray(currentPath),
                            preview: newPath,
                            name: newPath.slice(newPath.lastIndexOf("\\") + 1),
                            view: view,
                            filters: filters,
                        });
                    }
                    else {
                        const data = fs.readFileSync(newPath, "utf8");
                        if (theme[newPath]) {
                            return res.render("editor.hbs", {
                                path: getPathArray(currentPath),
                                preview: newPath,
                                name: newPath.slice(newPath.lastIndexOf("\\") + 1),
                                contents: data,
                                theme: theme[newPath].theme || "normal-theme",
                                font: theme[newPath].font || 16,
                            });
                        } else {
                            return res.render("editor.hbs", {
                                path: getPathArray(currentPath),
                                preview: newPath,
                                name: newPath.slice(newPath.lastIndexOf("\\") + 1),
                                contents: data,
                                theme: "normal-theme",
                                font: 16,
                            });
                        }
                    }
                }
            });
        }

        /*Save file*/
    } else if (req.body.request === "savefile") {
        const newPath = path.join(currentPath, req.body.name);
        const theme = JSON.parse(
            fs.readFileSync(path.join(__dirname, "static/themes.json"), "utf8")
        );
        if (fs.existsSync(newPath)) {
            fs.writeFileSync(newPath, req.body.contents);
        }

        if (theme[newPath]) {
            return res.render("editor.hbs", {
                path: getPathArray(currentPath),
                preview: newPath,
                name: req.body.name,
                contents: req.body.contents,
                theme: theme[newPath].theme || "normal-theme",
                font: theme[newPath].font || 16,
            });
        } else {
            return res.render("editor.hbs", {
                path: getPathArray(currentPath),
                preview: newPath,
                name: req.body.name,
                contents: req.body.contents,
                theme: "normal-theme",
                font: 16,
            });
        }

        /*Save image*/
    } else if (req.body.request === "saveimage") {
        const newPath = path.join(currentPath, req.body.name);
        const buffer = Buffer.from(req.body.dataUrl.split(",")[1], 'base64')
        fs.unlinkSync(newPath)
        fs.writeFileSync(newPath, buffer);

        const view = newPath.split("\\upload")[1]
        return res.render("editorimg.hbs", {
            path: getPathArray(currentPath),
            preview: newPath,
            name: req.body.name,
            view: view,
            filters: filters
        });

        /*Save file theme*/
    } else if (req.body.request === "savetheme") {
        const newPath = path.join(currentPath, req.body.name);
        const themePath = path.join(__dirname, "static/themes.json");
        if (fs.existsSync(themePath)) {
            let data = JSON.parse(fs.readFileSync(themePath, "utf8"));
            let temptheme = undefined
            try {
                temptheme = req.body.theme || data[newPath].theme
            } catch {}
            data[newPath] = {
                theme: temptheme || "normal-theme",
                font: req.body.font || data[newPath].font,
            };
            fs.writeFileSync(themePath, JSON.stringify(data, null, 4));
        }

        return res.render("editor.hbs", {
            path: getPathArray(currentPath),
            preview: newPath,
            name: req.body.name,
            contents: req.body.contents,
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
