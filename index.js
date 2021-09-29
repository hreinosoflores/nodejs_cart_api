const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const Sequelize = require('sequelize');

const app = express();

dotenv.config({ path: './.env' });

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const errorJSON = function (res, errCode, errMsg) {
    res.status(errCode).json({
        codigo: errCode,
        error: errMsg
    });
};

const {
    PORT,
    POSTGRES_DATABASE,
    POSTGRES_USER,
    POSTGRES_PASS,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DIALECT,
    TABLE_PRODUCTS,
    URL_PRODUCTS,
    TABLE_STORES,
    URL_STORES,
    TABLE_ORDERS,
    URL_ORDERS,
    TABLE_DETAILS,
    URL_DETAILS,
} = process.env;

const sequelize = new Sequelize(
    POSTGRES_DATABASE,
    POSTGRES_USER,
    POSTGRES_PASS,
    {
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        dialect: POSTGRES_DIALECT,
        define: {
            timestamps: false
        },
    }
);

sequelize.authenticate()
    .then(() => console.log(`SUCCESSFUL CONNECTION TO DATABASE '${POSTGRES_DATABASE}'`))
    .catch(error => console.log(`CONNECTION ERROR OUTPUT: ${error}`));


//------------PRODUCTS-------------------------------


//Parseando: tengo que parsear los datos de tipo bigint o numeric para no recibirlos como strings
const productsModel = sequelize.define(
    TABLE_PRODUCTS,
    {
        Id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, get() { return parseInt(this.getDataValue('Id')); } },
        Name: { type: Sequelize.STRING },
        Price: { type: Sequelize.NUMBER, get() { return parseFloat(this.getDataValue('Price')); } },
        Description: { type: Sequelize.STRING },
        Stock: { type: Sequelize.INTEGER }
    }
);


//Get Products
app.get(URL_PRODUCTS, (req, res) => {
    productsModel.findAll({ order: [['Id', 'ASC']] })
        .then(products => {
            const productsJson = [];
            products.forEach(product => {
                const { Id, Name, Price, Description, Stock } = product;
                productsJson.push(
                    {
                        id: Id,
                        name: Name,
                        price: Price,
                        description: Description,
                        stock: Stock
                    }
                );
            });
            res.json(productsJson);
        })
        .catch(error => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});


//Get Product by ID
app.get(`${URL_PRODUCTS}:id`, (req, res) => {
    productsModel.findByPk(req.params.id)
        .then(product => {
            const { Id, Name, Price, Description, Stock } = product;
            res.json({
                id: Id,
                name: Name,
                price: Price,
                description: Description,
                stock: Stock
            })
        })
        .catch(error => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});


//Add new Product
app.post(URL_PRODUCTS, (req, res) => {

    const { name, price, description, stock } = req.body;

    productsModel.create({
        Name: name,
        Price: price,
        Description: description,
        Stock: stock
    })
        .then(product => {
            const { Id } = product;
            res.json({
                id: Id,
                ...req.body
            })
            console.log(`NEW PRODUCT INSERTED WITH ID ${Id}`);
        })
        .catch(error => console.log(`ERROR WHILE ADDING DATA: ${error}`));
});


//Update Stock
app.patch(`${URL_PRODUCTS}:id/:qty`, (req, res) => {
    productsModel.decrement('Stock', { by: req.params.qty, where: { Id: req.params.id } })
        .then(resultado => {
            if (resultado[0][1] == 1) {
                console.log('STOCK SUCCESSFULLY UPDATED!!');
                res.end();
            } else {
                errorJSON(res, 400, `THERE IS NO PRODUCT WITH THE ID ${req.params.id}`);
            }
        })
        .catch(error => console.log(`ERROR WHILE UPDATING STOCK: ${error}`));
});



//------------STORES-------------------------------

const storesModel = sequelize.define(
    TABLE_STORES,
    {
        Id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, get() { return parseInt(this.getDataValue('Id')); } },
        Name: { type: Sequelize.STRING },
        Address: { type: Sequelize.STRING },
        City: { type: Sequelize.STRING },
        OpeningHours: { type: Sequelize.STRING }
    }
);


//Get Stores
app.get(URL_STORES, (req, res) => {
    storesModel.findAll({ order: [['Id', 'ASC']] })
        .then(stores => {
            const storesJson = [];
            stores.forEach(store => {
                const { Id, Name, Address, City, OpeningHours } = store;
                storesJson.push(
                    {
                        id: Id,
                        name: Name,
                        address: Address,
                        city: City,
                        openingHours: OpeningHours
                    }
                );
            });
            res.json(storesJson);
        })
        .catch(error => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});

//------------ORDERS-------------------------------

const ordersModel = sequelize.define(
    TABLE_ORDERS,
    {
        Id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, get() { return parseInt(this.getDataValue('Id')); } },
        Name: { type: Sequelize.STRING },
        Date: { type: Sequelize.STRING },
        Pickup: { type: Sequelize.BOOLEAN },
        StoreId: { type: Sequelize.BIGINT, get() { return parseInt(this.getDataValue('Id')); } },
        ShippingAddress: { type: Sequelize.STRING },
        City: { type: Sequelize.STRING },
        Total: { type: Sequelize.NUMBER, get() { return parseFloat(this.getDataValue('Total')); } }
    }
);


//Get Orders
app.get(URL_ORDERS, (req, res) => {
    ordersModel.findAll({ order: [['Id', 'ASC']] })
        .then(orders => {
            const ordersJson = [];
            orders.forEach(order => {
                const { Id, Name, Date, Pickup, StoreId, ShippingAddress, City, Total } = order;
                ordersJson.push(
                    {
                        id: Id,
                        name: Name,
                        date: Date,
                        pickup: Pickup,
                        storeId: StoreId,
                        shippingAddress: ShippingAddress,
                        city: City,
                        total: Total
                    }
                );
            });
            res.json(ordersJson);
        })
        .catch(error => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});


//Add new Order
app.post(URL_ORDERS, (req, res) => {

    console.log('ORDER BODY ->', req.body);

    const { name, date, pickup, storeId, shippingAddress, city, total } = req.body;

    ordersModel.create({
        Name: name,
        Date: date,
        Pickup: pickup,
        StoreId: storeId,
        ShippingAddress: shippingAddress,
        City: city,
        Total: total
    })
        .then(order => {
            const { Id } = order;
            res.json({
                id: Id,
                ...req.body
            })
            console.log(`NEW ORDER REGISTERED WITH ID  ${Id}`);
        })
        .catch(error => console.log(`ERROR WHILE ADDING DATA: ${error}`));
});


//------------DETAILS-------------------------------

const detailsModel = sequelize.define(
    TABLE_DETAILS,
    {
        Id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, get() { return parseInt(this.getDataValue('Id')); } },
        OrderId: { type: Sequelize.BIGINT, get() { return parseInt(this.getDataValue('OrderId')); } },
        ProductId: { type: Sequelize.BIGINT, get() { return parseInt(this.getDataValue('ProductId')); } },
        Quantity: { type: Sequelize.INTEGER },
        Subtotal: { type: Sequelize.NUMBER, get() { return parseFloat(this.getDataValue('Subtotal')); } }
    },
    {
        //Para evitar que sequelize busque el plural siempre 
        //del nombre del modelo como si fuera el nombre de la tabla
        //«DetailsOrders» -> TABLE_DETAILS
        freezeTableName: true,
    }
);


//Get Details
app.get(`${URL_DETAILS}get/all`, (req, res) => {
    detailsModel.findAll({ order: [['Id', 'ASC']] })
        .then(details => {
            const detailsJson = [];
            details.forEach(detail => {
                const { Id, OrderId, ProductId, Quantity, Subtotal } = detail;
                detailsJson.push(
                    {
                        id: Id,
                        orderId: OrderId,
                        productId: ProductId,
                        quantity: Quantity,
                        subtotal: Subtotal
                    }
                );
            });
            res.json(detailsJson);
        })
        .catch(error => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});

//Add Details in Batch/Bulk
app.post(`${URL_DETAILS}add/batch`, (req, res) => {
    console.log('DETAIL ARRAY ->', req.body);
    let bulk = [];
    req.body.forEach(detail => {
        const { orderId, productId, quantity, subtotal } = detail;
        bulk.push(
            {
                OrderId: orderId,
                ProductId: productId,
                Quantity: quantity,
                Subtotal: subtotal
            }
        );
    });
    console.log('BULK ->', bulk);
    detailsModel.bulkCreate(bulk)
        .then(details => {
            const detailsJson = [];
            details.forEach(detail => {
                const { Id, OrderId, ProductId, Quantity, Subtotal } = detail;
                detailsJson.push(
                    {
                        id: Id,
                        orderId: OrderId,
                        productId: ProductId,
                        quantity: Quantity,
                        subtotal: Subtotal
                    }
                );
            });
            res.json(detailsJson);
            console.log(`DETAILS ADDED IN ORDER WITH ID  ${details[0].OrderId}`);
        })
        .catch(error => console.log(`ERROR WHILE ADDING DATA: ${error}`));
});

app.use(function (req, res, next) {
    errorJSON(res, 404, 'URL no encontrada');
});

const puerto = PORT || 25788;
app.listen(puerto, () => {
    console.log(`SERVER UP ON PORT ${puerto}!!`);
});