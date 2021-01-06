const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.sendgrid_API_key)

// send returns a promise. We can also use html
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'aditikhandelwal2000@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelMail = (email, name) => {
    sgMail.send({
        to:email,
        from:'aditikhandelwal2000@gmail.com',
        subject: 'You have removed your account!',
        text: `Dear ${name}, you have removed your account. Let me know where we went wrong with the app.`
    })
}

module.exports ={
    sendWelcomeEmail,sendCancelMail
}

