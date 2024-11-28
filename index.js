import express, { urlencoded, json } from "express";
import Sequelize, { BIGINT, STRING, NUMBER, INTEGER, BOOLEAN } from "sequelize";
import cors from "cors";

const app = express();

app.use(cors());

app.use(urlencoded({ extended: false }));
app.use(json());

const errorJSON = function (res, errCode, errMsg) {
  res.status(errCode).json({
    codigo: errCode,
    error: errMsg,
  });
};

const PORT = 25788;
const POSTGRES_DATABASE = "angular3";
const POSTGRES_USER = "postgres";
const POSTGRES_PASS = "postgres";
const POSTGRES_HOST = "localhost";
const POSTGRES_PORT = 5432;
const POSTGRES_DIALECT = "postgres";
const TABLE_PRODUCTS = "Products";
const URL_PRODUCTS = "/api/Products/";
const TABLE_STORES = "Stores";
const URL_STORES = "/api/Stores/";
const TABLE_ORDERS = "Orders";
const URL_ORDERS = "/api/Orders/";
const TABLE_DETAILS = "DetailsOrder";
const URL_DETAILS = "/api/DetailsOrder/";

const sequelize = new Sequelize(
  POSTGRES_DATABASE,
  POSTGRES_USER,
  POSTGRES_PASS,
  {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: POSTGRES_DIALECT,
    define: {
      timestamps: false,
    },
  }
);

sequelize
  .authenticate()
  .then(() =>
    console.log(`SUCCESSFUL CONNECTION TO DATABASE '${POSTGRES_DATABASE}'`)
  )
  .catch((error) => console.log(`CONNECTION ERROR OUTPUT: ${error}`));

//------------PRODUCTS-------------------------------

//Parseando: tengo que parsear los datos de tipo bigint o numeric para no recibirlos como strings
const productsModel = sequelize.define(TABLE_PRODUCTS, {
  Id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    get() {
      return parseInt(this.getDataValue("Id"));
    },
  },
  Name: { type: STRING },
  Price: {
    type: NUMBER,
    get() {
      return parseFloat(this.getDataValue("Price"));
    },
  },
  Description: { type: STRING },
  Stock: { type: INTEGER },
});

//Get Products
app.get(URL_PRODUCTS, (req, res) => {
  productsModel
    .findAll({ order: [["Id", "ASC"]] })
    .then((products) => {
      const productsJson = [];
      products.forEach((product) => {
        const { Id, Name, Price, Description, Stock } = product;
        productsJson.push({
          id: Id,
          name: Name,
          price: Price,
          description: Description,
          stock: Stock,
        });
      });
      res.json(productsJson);
    })
    .catch((error) => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});

//Get Product by ID
app.get(`${URL_PRODUCTS}:id`, (req, res) => {
  productsModel
    .findByPk(req.params.id)
    .then((product) => {
      const { Id, Name, Price, Description, Stock } = product;
      res.json({
        id: Id,
        name: Name,
        price: Price,
        description: Description,
        stock: Stock,
      });
    })
    .catch((error) => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});

//Add new Product
app.post(URL_PRODUCTS, (req, res) => {
  const { name, price, description, stock } = req.body;

  productsModel
    .create({
      Name: name,
      Price: price,
      Description: description,
      Stock: stock,
    })
    .then((product) => {
      const { Id } = product;
      res.json({
        id: Id,
        ...req.body,
      });
      console.log(`NEW PRODUCT INSERTED WITH ID ${Id}`);
    })
    .catch((error) => console.log(`ERROR WHILE ADDING DATA: ${error}`));
});

//Update Stock
app.patch(`${URL_PRODUCTS}:id/:qty`, (req, res) => {
  productsModel
    .decrement("Stock", { by: req.params.qty, where: { Id: req.params.id } })
    .then((resultado) => {
      if (resultado[0][1] == 1) {
        console.log("STOCK SUCCESSFULLY UPDATED!!");
        res.end();
      } else {
        errorJSON(res, 400, `THERE IS NO PRODUCT WITH THE ID ${req.params.id}`);
      }
    })
    .catch((error) => console.log(`ERROR WHILE UPDATING STOCK: ${error}`));
});

//------------STORES-------------------------------

const storesModel = sequelize.define(TABLE_STORES, {
  Id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    get() {
      return parseInt(this.getDataValue("Id"));
    },
  },
  Name: { type: STRING },
  Address: { type: STRING },
  City: { type: STRING },
  OpeningHours: { type: STRING },
});

//Get Stores
app.get(URL_STORES, (req, res) => {
  storesModel
    .findAll({ order: [["Id", "ASC"]] })
    .then((stores) => {
      const storesJson = [];
      stores.forEach((store) => {
        const { Id, Name, Address, City, OpeningHours } = store;
        storesJson.push({
          id: Id,
          name: Name,
          address: Address,
          city: City,
          openingHours: OpeningHours,
        });
      });
      res.json(storesJson);
    })
    .catch((error) => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});

//------------ORDERS-------------------------------

const ordersModel = sequelize.define(TABLE_ORDERS, {
  Id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
    get() {
      return parseInt(this.getDataValue("Id"));
    },
  },
  Name: { type: STRING },
  Date: { type: STRING },
  Pickup: { type: BOOLEAN },
  StoreId: {
    type: BIGINT,
    get() {
      return parseInt(this.getDataValue("Id"));
    },
  },
  ShippingAddress: { type: STRING },
  City: { type: STRING },
  Total: {
    type: NUMBER,
    get() {
      return parseFloat(this.getDataValue("Total"));
    },
  },
});

//Get Orders
app.get(URL_ORDERS, (req, res) => {
  ordersModel
    .findAll({ order: [["Id", "ASC"]] })
    .then((orders) => {
      const ordersJson = [];
      orders.forEach((order) => {
        const {
          Id,
          Name,
          Date,
          Pickup,
          StoreId,
          ShippingAddress,
          City,
          Total,
        } = order;
        ordersJson.push({
          id: Id,
          name: Name,
          date: Date,
          pickup: Pickup,
          storeId: StoreId,
          shippingAddress: ShippingAddress,
          city: City,
          total: Total,
        });
      });
      res.json(ordersJson);
    })
    .catch((error) => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});

//Add new Order
app.post(URL_ORDERS, (req, res) => {
  console.log("ORDER BODY ->", req.body);

  const { name, date, pickup, storeId, shippingAddress, city, total } =
    req.body;

  ordersModel
    .create({
      Name: name,
      Date: date,
      Pickup: pickup,
      StoreId: storeId,
      ShippingAddress: shippingAddress,
      City: city,
      Total: total,
    })
    .then((order) => {
      const { Id } = order;
      res.json({
        id: Id,
        ...req.body,
      });
      console.log(`NEW ORDER REGISTERED WITH ID  ${Id}`);
    })
    .catch((error) => console.log(`ERROR WHILE ADDING DATA: ${error}`));
});

//------------DETAILS-------------------------------

const detailsModel = sequelize.define(
  TABLE_DETAILS,
  {
    Id: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true,
      get() {
        return parseInt(this.getDataValue("Id"));
      },
    },
    OrderId: {
      type: BIGINT,
      get() {
        return parseInt(this.getDataValue("OrderId"));
      },
    },
    ProductId: {
      type: BIGINT,
      get() {
        return parseInt(this.getDataValue("ProductId"));
      },
    },
    Quantity: { type: INTEGER },
    Subtotal: {
      type: NUMBER,
      get() {
        return parseFloat(this.getDataValue("Subtotal"));
      },
    },
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
  detailsModel
    .findAll({ order: [["Id", "ASC"]] })
    .then((details) => {
      const detailsJson = [];
      details.forEach((detail) => {
        const { Id, OrderId, ProductId, Quantity, Subtotal } = detail;
        detailsJson.push({
          id: Id,
          orderId: OrderId,
          productId: ProductId,
          quantity: Quantity,
          subtotal: Subtotal,
        });
      });
      res.json(detailsJson);
    })
    .catch((error) => console.log(`ERROR WHILE QUERYING DATA: ${error}`));
});

//Add Details in Batch/Bulk
app.post(`${URL_DETAILS}add/batch`, (req, res) => {
  console.log("DETAIL ARRAY ->", req.body);
  let bulk = [];
  req.body.forEach((detail) => {
    const { orderId, productId, quantity, subtotal } = detail;
    bulk.push({
      OrderId: orderId,
      ProductId: productId,
      Quantity: quantity,
      Subtotal: subtotal,
    });
  });
  console.log("BULK ->", bulk);
  detailsModel
    .bulkCreate(bulk)
    .then((details) => {
      const detailsJson = [];
      details.forEach((detail) => {
        const { Id, OrderId, ProductId, Quantity, Subtotal } = detail;
        detailsJson.push({
          id: Id,
          orderId: OrderId,
          productId: ProductId,
          quantity: Quantity,
          subtotal: Subtotal,
        });
      });
      res.json(detailsJson);
      console.log(`DETAILS ADDED IN ORDER WITH ID  ${details[0].OrderId}`);
    })
    .catch((error) => console.log(`ERROR WHILE ADDING DATA: ${error}`));
});

app.use(function (req, res) {
  errorJSON(res, 404, "URL no encontrada");
});

const puerto = PORT || 25788;
app.listen(puerto, () => {
  console.log(`SERVER UP ON PORT ${puerto}!!`);
});
