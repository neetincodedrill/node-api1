const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path')
require("dotenv").config();
var url = process.env.DB;
var formidable = require('formidable');
const { dataValidation, emailformatvalidation,imagevalidation}  = require('./validation')

const requestHandler = (req,res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type','application/json') 
  if(req.method === "POST"){
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {  
        // var oldPath = files.filepath;
        // var newpath = path.join(__dirname,'images') + '/'+files.originalFilename;
        // var rawData = fs.readFileSync(oldPath)
        // console.log(oldPath,newpath,rawData);
      // console.log(fields)
      // console.log(files)
    let first_name = fields.first_name;
    let last_name = fields.last_name;
    let age = fields.age;
    let email = fields.email;
    let imageType = files.file.mimetype;  
      //mongodb connection  
    MongoClient.connect(url,function(err,db){
      if(err) throw err;
      var dbo = db.db('mydb');
      var data = {
        image : files,
        field :fields
      }     
        //define collection
      var User =  dbo.collection('user')
        //function to validate the data and files
      var fieldValidation = [
        dataValidation(first_name,last_name,age),
        imagevalidation(imageType),
        emailformatvalidation(email),
      ]

      const newUser = User.find({"field.email":email })
      newUser.toArray(function(err,result){
        console.log(result[0]);       
        if(result[0]){
          const message = 'User with emailid already exits'
          res.writeHead(401);  
          return res.end(JSON.stringify({'message': message}, null, 2));    
        }
        else{
          if(fieldValidation[0] === true && fieldValidation[1] === true && fieldValidation[2] === true){    
            User.insertOne(data,
            function(err,result){
            if(err) throw err;          
             })                    
               
            const message = 'User Data collected'
            res.writeHead(200);  
            return res.end(JSON.stringify({'message': message}, null, 2));    
          }
          else{
                //sending validation error
            var message = []
            for(i=0;i<fieldValidation.length;i++){        
              if(typeof fieldValidation[i] === 'string'){
                message.push(fieldValidation[i])                                      
              }
            }    
            console.log(message)
            res.writeHead(400);    
            res.write(JSON.stringify(message))      
            return res.end();
            }   
          }
        })          
      });
    })  
  }
  else if(req.method === 'GET'){
    MongoClient.connect(url,function(err,db){
      if(err) throw err;
      var dbo = db.db('mydb');
      if(dbo){
        return dbo.collection('user').find({}).toArray(function(err,result){
        if(err) throw err;   
        res.writeHead(200,{'Content-Type':'application/json'})         
        res.end(JSON.stringify(result))           
        }) 
      }      
    })    
  }
  else{
      return "Only POST and GET request can be called"
  }
}

const server =  http.createServer(requestHandler)

const port = 7000;
const host = 'localhost';
server.listen(port,host)
console.log(`Server is running at localhost:${port}`)