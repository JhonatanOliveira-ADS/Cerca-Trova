import { Request, Response } from "express";
import PetsTinderServices from "../Services/petsTinderServices";

class PetsTinderControllers {
  /* Entrega somente pets ativos persistidos no banco. */
  async listarPets(req: Request, res: Response) {
    const service = new PetsTinderServices();
    return res.json(await service.listarPetsAtivos());
  }

  /* Salva um pet novo usando o usuário extraído do token JWT. */
  async criarPet(req: Request, res: Response) {
    const {
      nome,
      especie,
      raca,
      idade,
      sexo,
      porte,
      cidade,
      descricao,
      personalidade,
    } = req.body;
    const service = new PetsTinderServices();
    const pet = await service.criarPet({
      nome,
      especie,
      raca: raca || "",
      idade,
      sexo,
      porte,
      cidade,
      descricao,
      personalidade: personalidade || "",
      foto: req.file?.filename || "",
      id_usuario: req.usuarioId,
    });

    return res.status(201).json(pet);
  }
}

export default PetsTinderControllers;
