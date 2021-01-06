const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true
})


// const me = new User({
//     name:'Prakriti',
//     age:20,
//     email: 'aditi@gmail.com'
// })

// me.save().then((result)=>{
// console.log('Success', result)
// }).catch((error)=>{
//     console.log('Error',error)
// })



// const task = new Task({
//     description :"Learn node.js",
    
// })

// task.save().then((result)=>{
//   console.log(result)
// }).catch((error)=>{
//   console.log(error)
// })