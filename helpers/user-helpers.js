var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
var objectId = require("mongodb").ObjectId;
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collections.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(userData);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ Email: userData.Email });

      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Invalid Username");
        resolve({ status: false });
      }
    });
  },
  addToCart: (userId, proId) => {
    let proObj ={
      item:objectId(proId),
      quantity:1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(product=> product.item==proId);
        if(proExist != -1){
          db.get().collection(collections.CART_COLLECTION).updateOne({'products.item':objectId(proId)},
        { 

          $inc: {'products.$.quantity':1}

        }).then(()=>{
          resolve();
        })
        }else{
          db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { user: objectId(userId) },
            {
              $push: { products: proObj },
            }
          )
          .then((response) => {
            resolve();
          });
        }
      
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartItems:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                  item:'$products.item',
                  quantity:'$products.quantity'
                }
            },
            {
              $lookup:{
                from:collections.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
              }
            }
            
        ]

        ).toArray()
        console.log(cartItems)
        resolve(cartItems)
    })
  },
  getCartCount:(userId)=>{
    let count = 0;
    return new Promise(async(resolve,reject)=>{
      let cart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)});
      if (cart){
        count=cart.products.length;
      }
      resolve(count);
  
    })
    
  }
};
 