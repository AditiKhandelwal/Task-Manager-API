const express = require('express')
const Task = require('./models/task')
require('./db/mongoose')
const User = require('./models/user')
// to put routes in separate files 
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task') 

const app =  express()
const port = process.env.PORT || 3000

// Express middleware function ( for using authentication )
// app.use((req, res, next) => {
//     res.status(503).send('Under maintainance')
// })

//automatically converts incoming data into json format
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port, () =>{
    console.log("Server is up on port " + port)
})

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     const user = await User.findById('')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

