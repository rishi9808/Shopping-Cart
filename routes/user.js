const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helpers')
const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next();
  }else{
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/',async function(req, res, next){
  let cartCount = null;
  let user=req.session.user;
  //console.log(user);
  if (user){
  cartCount = await userHelpers.getCartCount(user._id);
  }
  productHelpers.getAllProducts().then((products)=>{
  res.render('user/view-product',{admin:false,products,user,cartCount})
});
});

router.get('/login',function(req,res){
  if(req.session.loggedIn){
    res.redirect('/');
  }else{
    res.render('user/login',{"loginErr":req.session.loginErr});
    req.session.loginErr=false;
  }
})

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/')
})

router.get('/signup',function(req,res){
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((data)=>{
    //console.log(data);
    req.session.loggedIn=true;
    req.session.user=response;
    res.redirect('/');
  })
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true;
      req.session.user=response.user;
      res.redirect('/');
    }else{
      req.session.loginErr=true;
      res.redirect('/login');
    }
  });
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let user=req.session.user;
  let products=await userHelpers.getCartItems(user._id)
  console.log(products);
  res.render('user/cart',{user,products});
})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call");
  userHelpers.addToCart(req.session.user._id,req.params.id).then(()=>{
    res.json({status:true});
  })
})



module.exports = router;
