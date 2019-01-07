const express = require("express")
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");
const dbUrl = "mongodb://mina:mina123456@ds139655.mlab.com:39655/fccmongo";

app.get("/",(req, res)=>{
	res.sendFile(__dirname+"/view/index.html");
})
app.use(express.static(__dirname+"/public"));

// mongoose.connect(process.env.dbUrl, { useNewUrlParser: true });
mongoose.connect(dbUrl,{ useNewUrlParser: true });
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username:{
		type: String,
		required: true
	},
	userId: {
		type: String,
		required: true,
		default: shortId.generate
	}
})
var User = mongoose.model('User',userSchema);

var exerciseSchema = new Schema({
	userId: {
		type: String,
		required: true
	},

	description:{
		type: String,
		required: true
	},
	duration: {
		type: String 
	},
	date: {
		type: Date,
		default: Date.now
	},
})
var Excercise = mongoose.model('Excercise',exerciseSchema);

app.use('/',bodyParser.urlencoded({extended: false}));
app.post("/api/exercise/new-user",(req,res)=>{
	var username = req.body.username;
	User.find({username:username},(err,data)=>{
		if(err){
			//error handling
		}else{
			if(data.length<1 ){
				var newUser = new User({
					username: username
				})
				newUser.save((err,data)=>{
					if(err){
						//error handling
					}else {
						res.json({'username': username,'id': data.userId});
					}
				})
			}else{
				res.send("username already taken");
			}
		}
	})
	
})
app.get("/api/exercise/users",(req, res)=>{
	// res.send("usernames");
	User.find((err,data)=>{
		if(err){
			//err handling
		}else {
			res.json(data.map((value)=>{
								return{
									"username":value.username,
									"userId":value.userId
								}
						}));
		}
	})
})
app.post("/api/exercise/add",(req,res)=>{

	var userId = req.body.userId;
	var description = req.body.description;
	var duration = req.body.duration;
	var date = req.body.date;

	User.find({userId:userId},(err,dataUser)=>{
		if(err){
			//error handling
		}else{
		
				var newExercise = new Excercise({
					userId: userId,
					description: description,
					duration: duration,
					date: date
				});
				newExercise.save((err,dataExe)=>{
					if(err){
						//error handling
					}else{

						res.json({
							username: dataUser[0].username,
							description: dataExe.description,
							duration: dataExe.duration,
							id: dataExe.userId,
							date: dataExe.date.toDateString(),
						})
					}
				})
			
		}
	})
})

app.get("/api/exercise/log/",(req,res)=>{
	var userId = req.query.userId;
	var from = new Date(req.query.from);
	// res.send(new Date(req.query.from));
	// var to = new Date(req.query.to);
	var limit = req.query.limit;
	User.find({userId:userId},(err,dataUser)=>{
		if(err){
			//error handling
		}else{
			if(dataUser.length<-1){
				res.json({
					error: "User not found"
				})
			}else{
				// ,date: { $lte: from, $gte: to}
				Excercise.find({userId: userId},(err,dataExe)=>{
					if(err){
						//error handling
					}else{
						res.json({
							id: dataUser[0].userId,
							username: dataUser[0].username,
							// from: from.toDateString(),
							// to: to.toDateString(),
							count: dataExe.length,
							log: dataExe.map((value)=>{
								return{
									"description":value.description,
									"duration":value.duration,
									"date":value.date.toDateString()
								}
								
							})
						})
					}
				});
			}
		}
	});
});

app.listen(process.env.PORT||8080);