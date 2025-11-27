if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}
console.log("DB_URL from env:", process.env.DB_URL);


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js")


const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("❌ DB_URL is undefined. Check your .env file");
  process.exit(1);
}

mongoose.connect(dbUrl)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
    process.exit(1);
  });

mongoose.connection.on("connected", () => {
  console.log("📦 MongoDB Ready");
});


main().then(()=>{
    console.log("connection successful");
})
.catch((err)=>{
console.log(err);
})
async function main(params) {
    await mongoose.connect(dbUrl);
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.secret
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() +7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}


app.use(session(sessionOptions));
app.use(flash());

const { saveRedirectUrl } = require("./middleware");  // ← ADD THIS
app.use(saveRedirectUrl);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
})








app.use("/listings",listingRouter); 
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.use((err,req,res,next)=>{
    let{statusCode=500,message="something is wrong"}=err;
    res.status(statusCode).send(message);
})
app.listen(8080,()=>{
    console.log("server listing at port 8080");
})