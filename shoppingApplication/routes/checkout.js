
var express                 = require('express');
var router                  = express.Router();
var Cart                    = require('../models/cart');
var Order                   = require('../models/order');
var paypal                  = require('paypal-rest-sdk');
//Paypal configuration
paypal.configure({
  'mode': 'sandbox',
  'client_id': 'add paypal client id here',
  'client_secret' : 'add client secret here'
});
// GET checkout page
router.get('/', ensureAuthenticated, function(req, res, next){
    console.log(`ROUTE: GET CHECKOUT PAGE`)
    var cart = new Cart(req.session.cart)
    var totalPrice = cart.totalPrice.toFixed(2)
    res.render('checkout', {title: 'Checkout Page', items: cart.generateArray(), totalPrice: cart.totalPrice.toFixed(2), bodyClass: 'registration', containerWrapper: 'container', userFirstName: req.user.fullname});
})
// POST checkout-process
router.post('/checkout-process', function(req, res){
  console.log(`ROUTE: POST CHECKOUT-PROGRESS`)
  var cart = new Cart(req.session.cart);        //Creates cart with current session
  var totalPrice = cart.totalPrice.toFixed(2);  //2 dec plce
  // Build PayPal payment request
  var payReq = JSON.stringify({
    intent:'sale',
    payer:{
      payment_method:'paypal'
    },
    //return the url page if check out complete or not
    redirect_urls:{
      return_url:'http://localhost:3000/checkout/checkout-success',
      cancel_url:'http://localhost:3000/checkout/checkout-cancel'
    },
    transactions:[{
      amount:{
        total:totalPrice,
        currency:'USD'
      },
      description:'Test Payments'
    }]
  });
  paypal.payment.create(payReq, function(error, payment){
    var links = {};
    if(error){
      console.error(JSON.stringify(error));
    } else {
      for (let i = 0; i < payment.links.length; i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});
// GET checkout-success
router.get('/checkout-success', ensureAuthenticated, function(req, res){
    console.log(`ROUTE: GET CHECKOUT-SUCCESS`)
    var cart = new Cart(req.session.cart);
    var totalPrice = cart.totalPrice.toFixed(2);
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": totalPrice
        }
      }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment){
      if(error){
        console.log(error.response);
        throw error;
      } else {
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        let userAddress = payment.payer.payer_info.shipping_address.line1 + ' ' + payment.payer.payer_info.shipping_address.city
        + ' ' + payment.payer.payer_info.shipping_address.state + ' ' + payment.payer.payer_info.shipping_address.postal_code
        let date = payment.create_time
        var order = new Order({
          orderID   : payerId,
          username  : req.user.username,
          address   : userAddress,
          orderDate : date,
          shipping  : true
        });
        order.save();
        console.log(order);
      }
    });
    res.render('checkoutSuccess', {title: 'Successful', containerWrapper: 'container', userFirstName: req.user.fullname})
    req.session.cart.totalPrice = 0;
    req.session.cart.totalQty = 0;
    req.session.cart.items = {};
});
// GET checkout-cancel
router.get('/checkout-cancel', ensureAuthenticated, function(req, res){
    console.log(`ROUTE: GET CHECKOUT-CANCEL`)
    res.render('checkoutCancel', {title: 'Successful', containerWrapper: 'container', userFirstName: req.user.fullname});
});
function ensureAuthenticated(req, res, next){
    //Checks whether the request was authenticated
    if(req.isAuthenticated()){
        return next();
    } else{
        //if not, returns error message and redirects user to the checkout page
        console.log(`ERROR: USER IS NOT AUTHENTICATED`)
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/');
    }
}
module.exports = router;
