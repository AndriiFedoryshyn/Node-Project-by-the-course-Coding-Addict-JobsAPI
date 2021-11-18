require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()

//security
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

//connect DB
const connectionDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')
//routes
const AuthRouter = require('./routes/auth')
const JobsRouter = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.use(express.json())
// extra packages
app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}))
app.use(cors())
app.use(xss())
app.use(helmet())
// routes
app.use('/api/v1/auth', AuthRouter)
app.use('/api/v1/jobs', authenticateUser, JobsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectionDB(process.env.MONGO_URI)
    app.listen(port, console.log(`Server is listening on port ${port}...`))
  } catch (error) {
    console.log(error)
  }
}

start()
