const express=require('express');
const app=express();
const cookieParser=require('cookie-parser'); 
const dotenv=require('dotenv');
dotenv.config({path:'config/config.env'});

const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);


app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(cookieParser());


const DOMAIN = 'http://localhost:4000';

app.post('/create-checkout-session', async (req, res) => {
    const itemId = req.body.itemId;
  
    // Retrieve the Price ID associated with the item ID
    const priceId = await getPriceIdFromItemId(itemId);
  
    if (!priceId) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${DOMAIN}/success.html`,
      cancel_url: `${DOMAIN}/cancel.html`,
    });
  
    res.redirect(303, session.url);
  });



const users=require('./routes/userRoute');
app.use('/api/v1',users);

const gesture=require('./routes/gestureRoute');
app.use('/api/v2',gesture);



function getPriceIdFromItemId(itemId) {
    // Implement your logic here to retrieve the Price ID associated with the item ID
    // This can involve querying a database or using a mapping of item IDs to Price IDs
    // For demonstration purposes, let's assume a hardcoded mapping
  
    const itemPriceMapping = {
      1: 'price_1NOEPxCdy1Cddm4bpOZe3rLu', // Replace with the actual Price ID for item ID 1
     
    };
  
    return itemPriceMapping[itemId] || null;
  }

module.exports=app;