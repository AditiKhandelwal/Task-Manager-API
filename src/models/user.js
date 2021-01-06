const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt =  require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
       type: String,
       required: true,
       trim: true
    },
    age:{
       type: Number,
       default:0,
       validate(value) {
           if(value<0){
               throw new Error('Age must be a positive number')
           }
       }
    },
    email:{
        type:String,
        unique: true,
        required: true,
        trim:true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type:String,
        required: true,
        trim:true,
        // minlength: 7,
        validate(value) {
            // if(value == 'password') {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Use another password')
            }
            else if(value.length <=6) {
                throw new Error('Password length should be greater than 6')
            }
        }
    },
    tokens: [{
        token: {
            type:String,
            required:true
        }
    }],
    avatar: {
        type:Buffer
    }
}, {
    timestamps:true
})

// relationship between task and user
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// when res.send is run json.stringify is called in background and toJson is run and required properties are sent for display
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//available on instances of model - token generation using id from db and secret key
userSchema.methods.generateAuthToken = async function () {
    const user = this 
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

// available on models -  login method
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
   
    if(!user){
        
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

//Hashing the password before saving
userSchema.pre('save', async function (next) {
    const user = this
// when user created or updated
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }


    next()
})

//Delete user tasks ehen user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User