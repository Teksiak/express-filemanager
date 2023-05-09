const express = require("express")
const path = require('path')
const hbs = require('express-handlebars')

const app = express()
const PORT = 3000   

app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.engine('hbs', hbs({
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {} 
}))

const context = {}

app.get("/", (req, res) => {
    res.render('main.hbs', context);
})

app.use(express.static('static'))

app.listen(PORT, () => {
    console.log('Server starting... PORT: ' + PORT)
})