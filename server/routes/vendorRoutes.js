const router = require('express').Router();

const {
listVendors,
listVendorProducts
} = require('../controllers/vendorController');

const admin=require(
'firebase-admin'
);

const db=
admin.firestore();


router.get(
'/',
listVendors
);

router.get(
'/:vendorId/products',
listVendorProducts
);


router.post(
'/:vendorId/products',

async(req,res)=>{

try{

const {
vendorId
}=req.params;

const product={

productId:
Date.now().toString(),

vendorId,

name:req.body.name,

price:req.body.price,

category:req.body.category,

image:req.body.image,

stock:req.body.stock,

createdAt:
new Date()
.toISOString()

};

await db
.collection(
'inventory'
)
.doc(
product.productId
)
.set(product);

res.status(201)
.json(product);

}
catch(err){

console.log(err);

res.status(500)
.json({

message:
err.message

});

}

}
);


router.delete(
'/:vendorId/products/:productId',

async(req,res)=>{

try{

await db
.collection(
'inventory'
)
.doc(
req.params.productId
)
.delete();

res.json({

success:true

});

}catch(err){

res.status(500)
.json({

message:
err.message

});

}

}
);


router.patch(
'/:vendorId/products/:productId',

async(req,res)=>{

try{

await db
.collection(
'inventory'
)
.doc(
req.params.productId
)
.update(
req.body
);

res.json({

success:true

});

}catch(err){

res.status(500)
.json({

message:
err.message

});

}

}
);

module.exports=
router;