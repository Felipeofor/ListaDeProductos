"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var handlebars = require("express-handlebars");
var fs = require("fs");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var routerAPI = express.Router();
var PORT = 8080; //+
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use("/api", routerAPI);
server.listen(PORT, function () { return console.log("Listening on port " + PORT + "..."); });
server.on("error", function (error) { return console.log("Server Error\n\t", error); });
// handlebars engine
app.engine("hbs", handlebars({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname + "/views/partials",
}));
app.set("views", "./views");
app.set("view engine", "hbs");
app.get('/', function (_, res) { return res.redirect('/productos'); });
//listado de productos
var productCatalog = [
    {
        id: 1,
        title: "Producto 1",
        price: 2310.91,
        thumbnail: "https://cdn3.iconfinder.com/data/icons/education-209/64/bus-vehicle-transport-school-128.png"
    },
    {
        id: 2,
        title: "Producto 2",
        price: 9999.99,
        thumbnail: "https://cdn3.iconfinder.com/data/icons/education-209/64/globe-earth-geograhy-planet-school-128.png"
    },
    {
        id: 3,
        title: "Producto 3",
        price: 11500.00,
        thumbnail: "https://cdn3.iconfinder.com/data/icons/education-209/64/plane-paper-toy-science-school-128.png"
    }
];
var messagesFile = 'mensajes/mensajes.json';
//Funciones para persistencia de datos en mensajes.json
function leerMensajes() {
    var messages = fs.readFileSync(messagesFile, "utf-8");
    var parsedMessages = JSON.parse(messages);
    console.log("File read correctly.");
    return parsedMessages;
}
function guardarMensajes(msj) {
    var messages = leerMensajes();
    messages.push(msj);
    fs.writeFileSync(messagesFile, JSON.stringify(messages));
    console.log("Message saved.");
}
// Ruta base para uso de HANDLEBARS
app.get('/productos', function (req, res) {
    if (productCatalog.length) {
        res.render('index', { ok: true, error: null, products: productCatalog });
    }
    else {
        res.render('index', { ok: false, error: 'No hay products cargados', productos: [] });
    }
});
io.on('connection', function (socket) {
    console.log('Someone is connected');
    socket.emit('productCatalog', { products: productCatalog, viewTitle: "Listado de productos", errorMessage: "No hay productos." });
    socket.on('newProduct', function (data) {
        productCatalog.push(__assign({ id: productCatalog.length + 1 }, data));
        console.log(productCatalog);
        io.sockets.emit('productCatalog', { products: productCatalog, viewTitle: "Listado de productos", errorMessage: "No hay productos." });
    });
    var messages = leerMensajes();
    socket.emit('messages', { messages: messages });
    socket.on('newMsg', function (data) {
        guardarMensajes(data);
        io.sockets.emit('messages', { messages: leerMensajes() });
    });
});
