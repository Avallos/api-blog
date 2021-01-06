require('dotenv').config()

const app = require('./app')
const port = 3000
require('./database')
require('./redis/blocklist-access-token')
require('./redis/allowlist-refresh-token')
const { InvalidArgumentError, NaoEncontrado, NaoAutorizado } = require('./src/erros')
const jwt = require('jsonwebtoken')
const {ConversorErro} = require('./src/conversores')

app.use((req, res, next) => {
    res.set({'Content-Type': 'application/json'})
    next()
})

const routes = require('./rotas')
routes(app)

app.use((erro, req, res, next) => {
    let status = 500
    const corpo = {erro: erro.message}

    if(erro instanceof NaoAutorizado) {
        status = 401
    }

    if(erro instanceof NaoEncontrado) {
        status = 404
    }
    
    if(erro instanceof InvalidArgumentError) {
        status = 400
    }

    if(erro instanceof jwt.JsonWebTokenError){
        status = 401
    }

    if(erro instanceof jwt.TokenExpiredError){
        status = 401
        corpo.expiradoEm = erro.expiredAt
    }
    const conversor = new ConversorErro()
    res.status(status).send(conversor.converter(corpo))
})

app.listen(port, () => console.log('A API está funcionando!'))
