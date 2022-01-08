import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../modules/users/useCases/createUser/ICreateUserDTO";
import { ShowUserProfileError } from "../../../modules/users/useCases/showUserProfile/ShowUserProfileError";
import { ShowUserProfileUseCase } from "../../../modules/users/useCases/showUserProfile/ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Show user profile use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });
  it("should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "username",
      email: "user@email.com",
      password: "123456",
    };
    await createUserUseCase.execute(user);
    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    const profile = await showUserProfileUseCase.execute(
      token.user.id as string
    );
    expect(profile).toHaveProperty("id");
  });
  it("should not be able to show user profile if the user does not exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("any_random_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
