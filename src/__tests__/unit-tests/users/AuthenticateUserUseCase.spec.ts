import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "../../../modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../modules/users/useCases/createUser/ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });
  it("should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "user",
      email: "user@mail.com",
      password: "123456",
    };
    await createUserUseCase.execute(user);
    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    expect(authenticatedUser).toHaveProperty("token");
  });
  it("should not be able to authenticate an unregistered user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "unregistered@mail.com",
        password: "random_password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
  it("should not be able to authenticate a user with a wrong password", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "user",
        email: "user@mail.com",
        password: "123456",
      };
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "wrong_password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
