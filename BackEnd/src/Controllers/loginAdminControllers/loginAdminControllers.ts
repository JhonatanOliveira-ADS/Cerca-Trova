import { Request, Response } from "express";
import LoginAdminServices from "../../Services/loginAdminServices/loginAdminServices";

class loginAdminControllers{
    async logarUsuario(req: Request, res: Response){
        const {email, senha} = req.body
        const enviarDados = new LoginAdminServices()
        const resposta = await enviarDados.logarAdmin({
            email,
            senha
        })
        return res.json(resposta)
    }
}

export default loginAdminControllers