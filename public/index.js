const socket = io();

socket.on('productCatalog', (productsData) => renderProducts(productsData));
let renderProducts = (productsData) => {
    if (productsData.products.length > 0) {
        //Productos
        let htmlProductos = productsData.products.map(e => `
        <div class="row product">
            <div class="col">${e.title}</div>
            <div class="col">$ ${e.price}</div>
            <div class="col-3"><img src="${e.thumbnail}" alt="" width="60" height="60"></div>
        </div>`
        ).join(' ');

        document.getElementById('viewTitle').innerHTML = productsData.viewTitle;
        document.getElementById('productCatalog').innerHTML = htmlProductos;
    } else {
        let html = `<div class="error" style="padding:2em;text-align:center">${data.errorMessage}</div>`;
        document.getElementById('productCatalog').innerHTML = html;
    }
}

socket.on('messages', (messagesData) => renderMessages(messagesData));
let renderMessages = (messagesData) => {
    //Mensajes
    let htmlMensajes = messagesData.messages.map((e, i) => `
             <div class="row">
                 <strong style="color: blue; font-size: 20px">${e.email} <em style="color: black; font-size: 12px">${e.date}</em></strong>
                 <em style="color: black; font-size: 20px; padding:0.5em">- ${e.msg}</em>
              </div>`
    ).join(' ');
    document.getElementById('messages').innerHTML = htmlMensajes;
}

function createProd(form) {
    console.log("Nuevo producto agregado!");
    let newProduct = {
        title: document.getElementById('title').value,
        price: parseFloat(document.getElementById('price').value),
        thumbnail: document.getElementById('thumbnail').value
    }
    socket.emit('newProduct', newProduct)
    console.log(newProuct);
    return false;
}

function getFormattedDate() {
    var date = new Date();
    var str = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return str;
}

function sendMsg(form) {
    let fullMsg = {
        email: document.getElementById('email').value,
        date: getFormattedDate(),
        msg: document.getElementById('msg').value
    }
    socket.emit('newMsg', fullMsg)
    console.log(fullMsg);
    return false;
}
