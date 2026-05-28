const { collections } = require('../config/firebase');

const listVendors = async (req, res, next) => {
    try {

        const snapshot =
        await collections.vendors.get();

        const vendors =
        snapshot.docs.map(doc=>({

            id:doc.id,
            ...doc.data()

        }));

        res.json(vendors);

    } catch (error) {

        next(error);

    }
};


const listVendorProducts =
async(req,res,next)=>{

try{

const vendorId=
req.params.vendorId;

const snapshot=
await collections.inventory
.where(
'vendorId',
'==',
vendorId
)
.get();

const products=
snapshot.docs.map(doc=>({

id:doc.id,

...doc.data()

}));

res.json(products);

}catch(error){

next(error);

}

};


module.exports={

listVendors,

listVendorProducts

};