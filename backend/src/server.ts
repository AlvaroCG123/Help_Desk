import express from 'express'
import cors from 'cors'
import { Login } from './controller/auth.controller.js'
import routesUsurio from './routes/usuario.routes.js'
import routesTecnico from './routes/tecnico.routes.js'
import routesChamado from './routes/chamado.routes.js'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.post("/login", Login)
app.use("/usuario", routesUsurio)
app.use("/tecnico", routesTecnico)
app.use("/chamado", routesChamado)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})