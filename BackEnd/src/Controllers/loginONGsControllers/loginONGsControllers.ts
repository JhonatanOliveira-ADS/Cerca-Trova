import { Request, Response } from "express";
import LoginONGServices from "../../Services/loginONGsServices/loginONGsServices";

class loginONGsControllers{
    async logarONG(req: Request, res: Response){
        const {email, senha} = req.body
        const enviarDados = new LoginONGServices()
        const resposta = await enviarDados.logarONG({
            email,
            senha
        })
        return res.json(resposta)
    }
}

export default loginONGsControllers