const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelMail} = require('../emails/account')

router.post('/users' , async (req, res) =>{
    const user = new User(req.body)

    try{
     await user.save()
     sendWelcomeEmail(user.email,user.name)
     // token generated 
     const token =await user.generateAuthToken()
     res.status(201).send({user,token})
    }
    catch(error) {
        res.status(400)
        res.send(error)
    }
    // Instead of using promise we are using async await
    
    // user.save().then(()=>{
    //      res.status(201).send(user)
    // }).catch((error)=>{
    //     res.status(400)
    //     res.send(error)
    // })
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }
    catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logout successfully')
    }
    catch(e) {
        res.status(500).send()

    }
    
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Logout successfully from all devices')
    }
    catch(e){
        res.status(500).send()
    }
})

// first middleware auth will run then our async function will run
router.get('/users/me', auth,  async (req,res)=>{

    // we dont want user to see other user details also so we comment the below code
    // try{
    //    const users = await User.find({})
    //    res.send(users)
    // }catch(e) {
    //     res.status(500).send()
    // }
     res.send(req.user)
    // :: Another method 
    // User.find({}).then((users)=>{
    //    res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})

// router.get('/users/:id',async (req,res)=>{
//     const _id = req.params.id

//     try{
//       const user = await User.findById(_id)
//       if(!user) {
//         return res.status(404).send()
//         }
//        res.send(user)
//     }catch(e) {
//         res.status(500).send()
//     }

//     // User.findById(_id).then((user) =>{
//     //     if(!user) {
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send()
//     // })
// })

router.patch('/users/me', auth, async (req, res)=> {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation =updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }
    try {
     //const user = await User.findById(req.params.id)
     updates.forEach((update) => req.user[update] = req.body[update])
     await req.user.save()
     
     //   const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
     
    //  if(!user) {
    //     return res.status(404).send()
    //     }
       res.send(req.user)
    }catch(e) {
        res.status(500).send(e)
    }
})

// we are using middleware so auth function will assign req.user
router.delete('/users/me',auth,  async (req, res) => {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user) {
        //     return res.status(404).send()
        //     }
        await req.user.remove()
        sendCancelMail(req.user.email,req.user.name)
           res.send(req.user)
        }catch(e) {
            res.status(500).send(e)
        }
})

//validating file upload
const avatar = multer({
    //dest:'images',
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})
//Image upload route
// avatar.single('avatar') is a middle ware
// extra function used to handle express errors
router.post('/users/me/avatar',auth, avatar.single('avatar') ,async (req,res) => {
    // auto cropping and image formating using sharp npm module
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('Image successfully uploaded')
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
})

// accessing profile images uding this url 
router.get('/users/:id/avatar', async (req, res) => {
    try {
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar) {
        throw new Error() 
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
   } catch(e) {
       res.status(400).send()
   }
})

module.exports = router