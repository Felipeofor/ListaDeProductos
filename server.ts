const express = require('express');
const handlebars = require('express-handlebars');
import fs = require('fs');

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const routerAPI = express.Router();
const PORT = 8080; //+
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use("/api", routerAPI);
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
server.on("error", (error: any) => console.log("Server Error\n\t", error));

// handlebars engine
app.engine(
    "hbs",
    handlebars({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views",
        partialsDir: __dirname + "/views/partials",
    })
);
app.set("views", "./views");
app.set("view engine", "hbs");
app.get('/', (_: any, res: { redirect: (arg0: string) => any; }) => res.redirect('/productos'));

//listado de productos
let productCatalog = [
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

let messagesFile = 'mensajes/mensajes.json';

//Funciones para persistencia de datos en mensajes.json
function leerMensajes() {
    let messages = fs.readFileSync(messagesFile, "utf-8")
    let parsedMessages = JSON.parse(messages);
    console.log("File read correctly.");
    return parsedMessages;
}

function guardarMensajes(msj: any) {
    let messages = leerMensajes();
    messages.push(msj);
    fs.writeFileSync(messagesFile, JSON.stringify(messages));
    console.log("Message saved.");
}

// Ruta base para uso de HANDLEBARS
app.get('/productos', (req: any, res: { render: (arg0: string, arg1: { ok: boolean; error: any; products?: { id: number; title: string; price: number; thumbnail: string; }[]; productos?: undefined[]; }) => void; }) => {
    if (productCatalog.length) {
        res.render('index', { ok: true, error: null, products: productCatalog })
    } else {
        res.render('index', { ok: false, error: 'No hay products cargados', productos: [] })
    }
})

io.on('connection', (socket: { emit: (arg0: string, arg1: { products?: { id: number; title: string; price: number; thumbnail: string; }[]; viewTitle?: string; errorMessage?: string; messages?: any; }) => void; on: (arg0: string, arg1: { (data: any): void; (data: any): void; }) => void; }) => {
    console.log('Someone is connected');

    socket.emit('productCatalog', { products: productCatalog, viewTitle: "Listado de productos", errorMessage: "No hay productos." });
    socket.on('newProduct', (data: {title: string; price: number; thumbnail: string; }) => {
        productCatalog.push({ id: productCatalog.length + 1, ...data });
        console.log(productCatalog);
        io.sockets.emit('productCatalog', { products: productCatalog, viewTitle: "Listado de productos", errorMessage: "No hay productos." });
    });

    let messages = leerMensajes();
    socket.emit('messages', { messages: messages });
    socket.on('newMsg', (data: any) => {
        guardarMensajes(data);
        io.sockets.emit('messages', { messages: leerMensajes() });
    });
});