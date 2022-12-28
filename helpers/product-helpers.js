var db = require('../config/connection');
var collections = require('../config/collections');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId;

module.exports={
    
    addProduct:(products,callback)=>{
        db.get().collection('product').insertOne(products).then((data)=>{
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false;
            let reponse ={};
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product);
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name : proDetails.Name,
                    Description : proDetails.Description,
                    Price : proDetails.Price,
                    Category : proDetails.Category
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}