/*made by lilun chen
 Student ID: 100971436
 */


var Product     = require('../models/product');
var User        = require('../models/user');
var Order        = require('../models/order');
var mongoose    = require('mongoose');



let completedTasks = 0;
const NUM_TASKS = 4;

mongoose.connect('mongodb://localhost/shoppingApp', function (err) {
    if (err) throw err;

    // Remove products
    Product.remove({}, (err) => {
        if (err) throw err;

        populateProducts();
        console.log("done  removing products");
        completedTasks++;
        exit();
    });
    Order.remove({}, (err) => {
        if (err) throw err;

        completedTasks++;
        console.log("done  removing orders");
        exit();
    });


    // Remove users
    User.remove({}, (err) => {
        if (err) throw err;
        // When users removed, add new users
        populateUsers();
        console.log("done  removing users");
        console.log("start the client");
        completedTasks++;
        exit();
    });


});

var products = [
    new Product({
      imagePath   : '/images/BOL.png',
      title       : 'League of Legends scripts',
      description : 'One month membership of BOL community',
      price       : 30.99
}),
    new Product({
      imagePath   : '/images/HanBot.png',
      title       : 'League of Legends scripts',
      description : 'One month mebership of Hanbot community',
      price       :  29.99
}),
  new Product({
    imagePath   : '/images/BQA.png',
    title       : 'PUBG Hack',
    description : 'Eas and AimBot',
    price       :  10.99
}),
  new Product({
    imagePath   : '/images/PASSA.png',
    title       : 'PUBG Hack',
    description : 'EAP and AimBot',
    price       :  12.99
}),
new Product({
    imagePath   : '/images/JR.png',
    title       : 'PUBG Hack',
    description : 'Esp and AimBot',
    price       :  15.09
}),
new Product({
    imagePath   : '/images/OMG.png',
    title       : 'PUBG Hack',
    description : 'Esp and aimbot',
    price       :  20.19
}),
  new Product({
    imagePath   : '/images/AWM.png',
    title       : 'PUBG HACK',
    description : 'Esp and AimBot',
    price       : 10.99
}),
  new Product({
    imagePath   : '/images/Panda.png',
    title       : 'PUBG HACK',
    description : 'Esp and AimBot',
    price       : 11.99
}),
  new Product({
    imagePath   : '/images/CNC.png',
    title       : 'PUBG HACK',
    description : 'Esp and Aimbot',
    price       : 13.45
}),
  new Product({
    imagePath   : '/images/tnt.png',
    title       : 'PUBG Hack',
    description : 'Esp and aimbot',
    price       : 20.12
}),
];


function populateProducts() {

    // Save each product
    for (let i = 0; i < products.length; i++) {
        products[i].save(function (err, result) {
            if (i === products.length - 1) {
                completedTasks++;
                console.log("done adding products");
                exit();
            }
        });
    }
}

function populateUsers() {
    var newUser = new User({
        username: 'admin@admin.com',
        password: 'admin',
        fullname: 'Tony Chen',
        admin: true
    });

    // Add the new user
    User.createUser(newUser, function (err, user) {
        if (err) throw err;

        completedTasks++;
        console.log("done adding users");
        exit();
    });
}


function exit() {

    if (completedTasks === NUM_TASKS){
      console.log("Quitting..");
      mongoose.disconnect();

    }
}
