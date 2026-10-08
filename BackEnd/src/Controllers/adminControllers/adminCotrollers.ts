import { Request, Response } from "express";
import AdminServices from "../../Services/adminServices/adminServices";

class AdminControllers {
  /* Recebe os dados do administrador e devolve somente dados públicos da conta. */
  async criarAdministrador(req: Request, res: Response) {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    const service = new AdminServices();
    const administrador = await service.criarAdministrador({
      nome,
      email,
      senha,
      telefone,
    });

    return res.status(201).json(administrador);
  }
}

export default AdminControllers;
