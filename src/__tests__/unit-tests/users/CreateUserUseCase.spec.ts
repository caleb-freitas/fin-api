import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "../../../modules/users/useCases/createUser/CreateUserError";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Create user use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });
  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@mail.com",
      password: "abc-1234",
    });
    expect(user).toHaveProperty("name");
  });
  it("should not be able to create a user with an email already registered", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "user_name",
        email: "same@mail.com",
        password: "abc-1234",
      });
      await createUserUseCase.execute({
        name: "user_name",
        email: "same@mail.com",
        password: "abc-1234",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
