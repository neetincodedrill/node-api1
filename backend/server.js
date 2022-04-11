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
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
       const form  = formidable();
       form.parse(req,async(err,fields,files) => {
           if(err){
               res.writeHead(400)
               res.end({
                   status:'Failure',
                   msg:"Some error occured" + err.message
               })
           }
           let oldPath = files.file.filepath;
           let newPath = `../images/${files.file.originalFilename}`;
           fs.rename(oldPath,newPath,(err) => {
              console.log('Image saved in image folder')
           })
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
          filepath : newPath,
          field :fields
        }  
        console.log(data)   
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
            res.end(JSON.stringify({'message': message}));    
            return;
          }
          else{
            if(fieldValidation[0] === true && fieldValidation[1] === true && fieldValidation[2] === true){    
              return User.insertOne(data,
              function(err,result){
              if(err) throw err; 
              const message = 'User Data collected'
              // res.writeHead(200);  
              res.end(JSON.stringify({'message':message}));            
               })                     
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
              return;
            }
          })          
        }); 
       })
       return;
    } else if(req.method === 'GET'){
      MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        if(dbo){
          dbo.collection('user').find({}).toArray(function(err,result){
          if(err) throw err;   
          res.writeHead(200,{'Content-Type':'application/json'})         
          res.end(JSON.stringify(result))
          return;           
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