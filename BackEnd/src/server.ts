import express, { Request, Response, NextFunction } from 'express'
import 'express-async-errors'
import cors from 'cors'
import router from './router'
import path from 'path'

const app = express()
app.use(express.json())
app.use(cors())
app.use(router)

app.use(
    '/files', express.static(path.resolve(__dirname, "..", 'tmp')))

app.use((err: error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error){
        return res.status(400).json({
            error: error.message
        })
    }
    return res.status(500).json({
        status: 'Erro'
        message: 'Erro interno do Servidor'
    })

})

app.listen(3333, () => console.log('Servidor OnLine na porta 3333'))


